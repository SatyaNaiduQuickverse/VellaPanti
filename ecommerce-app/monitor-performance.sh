#!/bin/bash

echo "🔍 ARM64 Performance Monitor"
echo "============================"

echo "System Info:"
echo "- Architecture: $(uname -m)"
echo "- CPU Cores: $(nproc)"
echo "- Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "- Node.js: $(node --version)"
echo ""

echo "Build Cache Status:"
echo "- Turbo cache size: $(du -sh .turbo 2>/dev/null | cut -f1 || echo '0')"
echo "- Next.js cache size: $(du -sh apps/web/.next 2>/dev/null | cut -f1 || echo '0')"
echo "- Node modules size: $(du -sh node_modules | cut -f1)"
echo ""

echo "Memory Usage During Build:"
echo "Starting build with monitoring..."

# Monitor memory usage during build
(
  while true; do
    echo "$(date): Memory $(free | awk '/^Mem:/ {printf "%.1f%%", $3/$2 * 100.0}'), CPU $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    sleep 2
  done
) &
MONITOR_PID=$!

# Run the build
time pnpm run build

# Stop monitoring
kill $MONITOR_PID 2>/dev/null

echo ""
echo "Performance tips for ARM64:"
echo "- Use NODE_OPTIONS='--max-old-space-size=4096' for large builds"
echo "- Enable turbo cache for faster subsequent builds"
echo "- Consider using SWC instead of Babel for faster compilation"
echo "- Monitor memory usage to avoid OOM kills"
