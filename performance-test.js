#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_PATH = '/home/ubuntu/projects/VellaPanti/ecommerce-app';

class PerformanceBenchmark {
  constructor() {
    this.results = {
      environment: {},
      compilation: {},
      system: {},
      timestamps: new Date().toISOString()
    };
  }

  async getSystemInfo() {
    console.log('📊 Gathering system information...');
    
    const commands = [
      { key: 'cpu', cmd: 'cat /proc/cpuinfo | grep -E "(model name|processor)" | head -4' },
      { key: 'memory', cmd: 'free -m' },
      { key: 'disk', cmd: 'df -h /' },
      { key: 'node', cmd: 'node --version' },
      { key: 'npm', cmd: 'npm --version' },
      { key: 'pnpm', cmd: 'pnpm --version' }
    ];

    for (const { key, cmd } of commands) {
      try {
        const result = await this.execCommand(cmd);
        this.results.environment[key] = result.trim();
      } catch (error) {
        this.results.environment[key] = `Error: ${error.message}`;
      }
    }
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout || stderr);
      });
    });
  }

  async monitorSystemDuring(taskName, asyncTask) {
    console.log(`🔍 Monitoring system during: ${taskName}`);
    
    const startTime = Date.now();
    let monitoring = true;
    const systemStats = [];

    // Monitor system resources every 500ms
    const monitorInterval = setInterval(async () => {
      if (!monitoring) return;
      
      try {
        const [cpu, memory] = await Promise.all([
          this.execCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1"),
          this.execCommand("free | grep '^Mem:' | awk '{printf \"%.1f\", $3/$2 * 100.0}'")
        ]);
        
        systemStats.push({
          timestamp: Date.now() - startTime,
          cpu: parseFloat(cpu) || 0,
          memory: parseFloat(memory) || 0
        });
      } catch (err) {
        // Ignore monitoring errors
      }
    }, 500);

    try {
      const result = await asyncTask();
      monitoring = false;
      clearInterval(monitorInterval);
      
      const duration = Date.now() - startTime;
      
      return {
        duration,
        result,
        systemStats: {
          avgCpu: systemStats.reduce((sum, s) => sum + s.cpu, 0) / systemStats.length || 0,
          maxCpu: Math.max(...systemStats.map(s => s.cpu), 0),
          avgMemory: systemStats.reduce((sum, s) => sum + s.memory, 0) / systemStats.length || 0,
          maxMemory: Math.max(...systemStats.map(s => s.memory), 0),
          samples: systemStats.length
        }
      };
    } finally {
      monitoring = false;
      clearInterval(monitorInterval);
    }
  }

  async testCompilation(type, command, cwd = PROJECT_PATH) {
    console.log(`⏱️  Testing ${type} compilation...`);
    
    const task = () => new Promise((resolve, reject) => {
      const startTime = Date.now();
      const child = spawn('bash', ['-c', command], { 
        cwd,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => stdout += data.toString());
      child.stderr.on('data', (data) => stderr += data.toString());
      
      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        resolve({
          exitCode: code,
          duration,
          stdout: stdout.slice(-2000), // Keep last 2000 chars
          stderr: stderr.slice(-2000)
        });
      });
      
      child.on('error', reject);
      
      // Kill after 5 minutes if still running
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGTERM');
          reject(new Error('Timeout: Process killed after 5 minutes'));
        }
      }, 5 * 60 * 1000);
    });

    return await this.monitorSystemDuring(type, task);
  }

  async cleanBuildCache() {
    console.log('🧹 Cleaning build cache...');
    try {
      await this.execCommand(`cd ${PROJECT_PATH} && pnpm run clean`);
      await this.execCommand(`cd ${PROJECT_PATH} && rm -rf node_modules/.cache`);
      await this.execCommand(`cd ${PROJECT_PATH}/apps/web && rm -rf .next`);
    } catch (error) {
      console.log('Cache clean error (may be expected):', error.message);
    }
  }

  async runBenchmarks() {
    console.log('🚀 Starting performance benchmarks...');
    
    await this.getSystemInfo();

    // Test 1: Cold start (clean build)
    await this.cleanBuildCache();
    const coldStart = await this.testCompilation(
      'Cold Start Build', 
      'pnpm run build'
    );
    this.results.compilation.coldStart = coldStart;

    // Test 2: Hot build (no changes)
    const hotBuild = await this.testCompilation(
      'Hot Build (No Changes)', 
      'pnpm run build'
    );
    this.results.compilation.hotBuild = hotBuild;

    // Test 3: Dev server startup
    await this.cleanBuildCache();
    
    // For dev server, we'll start it and measure time to first compilation
    console.log('⏱️  Testing dev server startup...');
    const devStartup = await this.monitorSystemDuring('Dev Server Startup', () => {
      return new Promise((resolve) => {
        const startTime = Date.now();
        const child = spawn('bash', ['-c', 'timeout 30s pnpm run dev'], { 
          cwd: PROJECT_PATH,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        const checkReady = (data) => {
          output += data.toString();
          if (output.includes('Ready in') || output.includes('Local:') || output.includes('ready')) {
            const duration = Date.now() - startTime;
            child.kill('SIGTERM');
            resolve({
              duration,
              exitCode: 0,
              stdout: output.slice(-1000)
            });
          }
        };

        child.stdout.on('data', checkReady);
        child.stderr.on('data', checkReady);
        
        // Fallback timeout
        setTimeout(() => {
          child.kill('SIGTERM');
          resolve({
            duration: Date.now() - startTime,
            exitCode: 124, // timeout exit code
            stdout: output.slice(-1000)
          });
        }, 25000);
      });
    });
    
    this.results.compilation.devStartup = devStartup;

    // Test 4: TypeScript check
    const typeCheck = await this.testCompilation(
      'TypeScript Check',
      'pnpm run type-check'
    );
    this.results.compilation.typeCheck = typeCheck;

    return this.results;
  }

  generateReport() {
    const report = `
# Next.js Performance Analysis Report
Generated: ${this.results.timestamps}

## System Environment
- **Architecture**: ARM64 (Oracle Cloud)
- **CPU**: ${this.results.environment.cpu?.split('\n')[0] || 'Unknown'}
- **Memory**: ${this.results.environment.memory?.split('\n')[1] || 'Unknown'}
- **Disk**: ${this.results.environment.disk?.split('\n')[1] || 'Unknown'}
- **Node.js**: ${this.results.environment.node || 'Unknown'}
- **pnpm**: ${this.results.environment.pnpm || 'Unknown'}

## Compilation Performance

### Cold Start Build
- **Duration**: ${(this.results.compilation.coldStart?.duration / 1000 || 0).toFixed(1)}s
- **CPU Usage**: Avg ${this.results.compilation.coldStart?.systemStats.avgCpu.toFixed(1)}%, Max ${this.results.compilation.coldStart?.systemStats.maxCpu.toFixed(1)}%
- **Memory Usage**: Avg ${this.results.compilation.coldStart?.systemStats.avgMemory.toFixed(1)}%, Max ${this.results.compilation.coldStart?.systemStats.maxMemory.toFixed(1)}%
- **Exit Code**: ${this.results.compilation.coldStart?.result.exitCode || 'N/A'}

### Hot Build (Cached)
- **Duration**: ${(this.results.compilation.hotBuild?.duration / 1000 || 0).toFixed(1)}s
- **CPU Usage**: Avg ${this.results.compilation.hotBuild?.systemStats.avgCpu.toFixed(1)}%, Max ${this.results.compilation.hotBuild?.systemStats.maxCpu.toFixed(1)}%
- **Memory Usage**: Avg ${this.results.compilation.hotBuild?.systemStats.avgMemory.toFixed(1)}%, Max ${this.results.compilation.hotBuild?.systemStats.maxMemory.toFixed(1)}%
- **Exit Code**: ${this.results.compilation.hotBuild?.result.exitCode || 'N/A'}

### Dev Server Startup
- **Duration**: ${(this.results.compilation.devStartup?.duration / 1000 || 0).toFixed(1)}s
- **CPU Usage**: Avg ${this.results.compilation.devStartup?.systemStats.avgCpu.toFixed(1)}%, Max ${this.results.compilation.devStartup?.systemStats.maxCpu.toFixed(1)}%
- **Memory Usage**: Avg ${this.results.compilation.devStartup?.systemStats.avgMemory.toFixed(1)}%, Max ${this.results.compilation.devStartup?.systemStats.maxMemory.toFixed(1)}%

### TypeScript Check
- **Duration**: ${(this.results.compilation.typeCheck?.duration / 1000 || 0).toFixed(1)}s
- **CPU Usage**: Avg ${this.results.compilation.typeCheck?.systemStats.avgCpu.toFixed(1)}%, Max ${this.results.compilation.typeCheck?.systemStats.maxCpu.toFixed(1)}%
- **Memory Usage**: Avg ${this.results.compilation.typeCheck?.systemStats.avgMemory.toFixed(1)}%, Max ${this.results.compilation.typeCheck?.systemStats.maxMemory.toFixed(1)}%
- **Exit Code**: ${this.results.compilation.typeCheck?.result.exitCode || 'N/A'}

## Performance Issues Identified

${this.analyzeBottlenecks()}

## Recommendations

${this.generateRecommendations()}
`;

    return report;
  }

  analyzeBottlenecks() {
    const issues = [];
    const { compilation } = this.results;

    if (compilation.coldStart?.duration > 30000) {
      issues.push('❌ **Cold start build > 30s** - Extremely slow initial compilation');
    } else if (compilation.coldStart?.duration > 15000) {
      issues.push('⚠️ **Cold start build > 15s** - Slow initial compilation');
    }

    if (compilation.devStartup?.duration > 10000) {
      issues.push('❌ **Dev server startup > 10s** - Slow development feedback');
    }

    if (compilation.typeCheck?.duration > 10000) {
      issues.push('⚠️ **TypeScript check > 10s** - Type checking bottleneck');
    }

    if (compilation.coldStart?.systemStats.maxMemory > 80) {
      issues.push('❌ **High memory usage** - Memory pressure during builds');
    }

    if (compilation.coldStart?.systemStats.maxCpu > 90) {
      issues.push('⚠️ **High CPU usage** - CPU intensive compilation');
    }

    return issues.length ? issues.join('\n') : '✅ No major bottlenecks detected';
  }

  generateRecommendations() {
    const recommendations = [];
    const { compilation } = this.results;

    // ARM64 specific recommendations
    recommendations.push('### ARM64 Optimizations');
    recommendations.push('- Use Node.js built for ARM64 (already using v20.19.4)');
    recommendations.push('- Consider enabling swc instead of Babel in Next.js config');
    recommendations.push('- Use native ARM64 compiled packages when possible');

    // Memory optimizations
    if (compilation.coldStart?.systemStats.maxMemory > 60) {
      recommendations.push('\n### Memory Optimizations');
      recommendations.push('- Set NODE_OPTIONS="--max-old-space-size=4096" for builds');
      recommendations.push('- Enable incremental TypeScript compilation');
      recommendations.push('- Consider reducing concurrent processes in turbo.json');
    }

    // Build optimizations
    recommendations.push('\n### Build Optimizations');
    recommendations.push('- Enable Next.js SWC minifier and compiler');
    recommendations.push('- Use turbo cache effectively');
    recommendations.push('- Consider webpack-bundle-analyzer for bundle size optimization');
    recommendations.push('- Enable experimental.esmExternals in next.config.js');

    return recommendations.join('\n');
  }
}

async function main() {
  const benchmark = new PerformanceBenchmark();
  
  try {
    const results = await benchmark.runBenchmarks();
    const report = benchmark.generateReport();
    
    // Save results
    fs.writeFileSync('/tmp/performance-results.json', JSON.stringify(results, null, 2));
    fs.writeFileSync('/tmp/performance-report.md', report);
    
    console.log('\n' + '='.repeat(80));
    console.log(report);
    console.log('='.repeat(80));
    console.log('\n📊 Results saved to /tmp/performance-results.json');
    console.log('📄 Report saved to /tmp/performance-report.md');
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceBenchmark;