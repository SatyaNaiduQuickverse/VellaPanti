# Bulk Product Upload Guide

This guide explains how to use the bulk product upload feature for VellaPanti ecommerce platform.

## Excel Template Structure

### Required Columns

| Column Name | Type | Required | Description | Example |
|-------------|------|----------|-------------|---------|
| `name` | String | Yes | Product name | "Premium Cotton T-Shirt" |
| `categorySlug` | String | Yes | Category slug (must exist) | "mens-tshirts" |
| `basePrice` | Number | Yes | Base price in rupees | 999 |

### Optional Product Columns

| Column Name | Type | Required | Description | Example |
|-------------|------|----------|-------------|---------|
| `description` | String | No | Product description | "High-quality cotton t-shirt..." |
| `baseSalePrice` | Number | No | Sale price in rupees | 799 |
| `images` | String | No | Comma-separated image URLs | "https://img1.jpg,https://img2.jpg" |
| `theme` | String | No | BLACK or WHITE | "BLACK" |
| `featured` | Boolean | No | Is product featured | true |
| `isActive` | Boolean | No | Is product active (default: true) | true |

### Variant Columns (Optional)

| Column Name | Type | Required | Description | Example |
|-------------|------|----------|-------------|---------|
| `variantSku` | String | No | Unique variant SKU | "TSH-001-S-BLK" |
| `variantSize` | String | No | Size (S, M, L, XL, etc.) | "M" |
| `variantColor` | String | No | Color name | "Black" |
| `variantMaterial` | String | No | Material type | "Cotton" |
| `variantPrice` | Number | No | Variant price (uses basePrice if empty) | 999 |
| `variantSalePrice` | Number | No | Variant sale price | 799 |
| `variantStock` | Number | No | Stock quantity | 50 |
| `variantImages` | String | No | Comma-separated variant image URLs | "https://variant1.jpg" |

## How to Use

### 1. Download Template
- Login as admin
- Go to Admin → Bulk Upload
- Click "Download Template" to get the Excel file with sample data

### 2. Prepare Your Data

#### Single Product (No Variants)
```excel
name: "Basic T-Shirt"
description: "Simple cotton t-shirt"
categorySlug: "mens-tshirts"
basePrice: 599
baseSalePrice: 499
images: "https://example.com/tshirt.jpg"
theme: "BLACK"
featured: false
isActive: true
(Leave all variant columns empty)
```

#### Product with Multiple Variants
For a product with multiple sizes/colors, create multiple rows:

**Row 1 (Main Product + First Variant):**
```excel
name: "Premium T-Shirt"
description: "High-quality cotton t-shirt"
categorySlug: "mens-tshirts"
basePrice: 999
baseSalePrice: 799
images: "https://example.com/main.jpg"
theme: "BLACK"
featured: true
isActive: true
variantSku: "PTS-001-S-BLK"
variantSize: "S"
variantColor: "Black"
variantMaterial: "Cotton"
variantPrice: 999
variantSalePrice: 799
variantStock: 25
variantImages: "https://example.com/s-black.jpg"
```

**Row 2 (Same Product + Second Variant):**
```excel
name: "Premium T-Shirt"
description: ""
categorySlug: "mens-tshirts"
basePrice: ""
baseSalePrice: ""
images: ""
theme: ""
featured: ""
isActive: ""
variantSku: "PTS-001-M-BLK"
variantSize: "M"
variantColor: "Black"
variantMaterial: "Cotton"
variantPrice: 999
variantSalePrice: 799
variantStock: 40
variantImages: "https://example.com/m-black.jpg"
```

### 3. Category Preparation

Before uploading products, ensure categories exist:
1. Go to Admin → Categories
2. Create all required categories manually
3. Note down the category slugs (e.g., "mens-tshirts", "womens-dresses")
4. Use these exact slugs in the `categorySlug` column

### 4. Image URLs

- Use direct image URLs (https://...)
- Images should be publicly accessible
- Multiple images: separate with commas (no spaces)
- Recommended size: 800x800px or larger
- Supported formats: JPG, PNG, WebP

### 5. Upload Process

1. Save your Excel file
2. Go to Admin → Bulk Upload
3. Click "Choose File" and select your Excel file
4. Click "Upload Products"
5. Review the results and error messages
6. Fix any errors and re-upload if needed

## Validation Rules

### Product Level
- ✅ Product name must be unique within the same category
- ✅ Category slug must exist in the database
- ✅ Base price must be a positive number
- ✅ Sale price (if provided) should be less than base price
- ✅ Theme must be either "BLACK" or "WHITE" (case-sensitive)

### Variant Level
- ✅ If any variant column is filled, the variant will be created
- ✅ Variant SKU should be unique across all products
- ✅ Variant price defaults to base price if not provided
- ✅ Stock defaults to 0 if not provided

## Common Errors and Solutions

### "Category 'xyz' not found"
**Solution:** Create the category first in Admin → Categories

### "Product 'ABC' already exists in this category"
**Solution:** Either use a different name or delete the existing product

### "Row X: Valid base price is required"
**Solution:** Ensure basePrice column has a positive number (not text)

### "Invalid data"
**Solution:** Check for special characters, correct data types, and required fields

## Tips for Success

1. **Start Small:** Test with 5-10 products first
2. **Use Template:** Always start with the downloaded template
3. **Check Categories:** Verify all category slugs exist before upload
4. **Validate Images:** Test image URLs in browser before upload
5. **Backup:** Keep a backup of your Excel file
6. **Review Results:** Always check the upload results for errors

## API Endpoints

- **Download Template:** `GET /api/bulk-upload/template`
- **Upload Products:** `POST /api/bulk-upload/products`

## File Limits

- Maximum file size: 10MB
- Supported formats: .xlsx, .xls
- Recommended: Maximum 1000 products per upload

## Support

If you encounter issues:
1. Check this guide first
2. Verify your Excel file matches the template structure
3. Test with a smaller batch
4. Contact support with specific error messages