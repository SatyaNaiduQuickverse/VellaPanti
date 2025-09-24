# Sample Excel Structure for Bulk Product Upload

## Column Structure (Copy to Excel)

| name | description | categorySlug | basePrice | baseSalePrice | images | theme | featured | isActive | variantSku | variantSize | variantColor | variantMaterial | variantPrice | variantSalePrice | variantStock | variantImages |
|------|-------------|--------------|-----------|---------------|--------|--------|----------|----------|------------|-------------|--------------|----------------|--------------|------------------|--------------|---------------|
| Premium Cotton T-Shirt | High-quality cotton t-shirt with premium fabric and comfort fit | mens-tshirts | 999 | 799 | https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400,https://images.unsplash.com/photo-1542272604-787c3835535d?w=400 | BLACK | TRUE | TRUE | TSH-001-S-BLK | S | Black | Cotton | 999 | 799 | 50 | https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400 |
| Premium Cotton T-Shirt |  | mens-tshirts |  |  |  |  |  |  | TSH-001-M-BLK | M | Black | Cotton | 999 | 799 | 75 |  |
| Premium Cotton T-Shirt |  | mens-tshirts |  |  |  |  |  |  | TSH-001-L-BLK | L | Black | Cotton | 999 | 799 | 60 |  |
| Premium Cotton T-Shirt |  | mens-tshirts |  |  |  |  |  |  | TSH-001-XL-BLK | XL | Black | Cotton | 999 | 799 | 40 |  |
| Premium Cotton T-Shirt |  | mens-tshirts |  |  |  |  |  |  | TSH-001-S-WHT | S | White | Cotton | 999 | 799 | 45 |  |
| Street Style Hoodie | Comfortable hoodie with urban street style design | mens-hoodies | 1599 | 1299 | https://images.unsplash.com/photo-1556821840-3a9b52b7a563?w=400,https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400 | BLACK | TRUE | TRUE | HOD-001-M-BLK | M | Black | Cotton Blend | 1599 | 1299 | 30 | https://images.unsplash.com/photo-1556821840-3a9b52b7a563?w=400 |
| Street Style Hoodie |  | mens-hoodies |  |  |  |  |  |  | HOD-001-L-BLK | L | Black | Cotton Blend | 1599 | 1299 | 25 |  |
| Street Style Hoodie |  | mens-hoodies |  |  |  |  |  |  | HOD-001-XL-BLK | XL | Black | Cotton Blend | 1599 | 1299 | 20 |  |
| Elegant Dress | Beautiful evening dress with premium fabric | womens-dresses | 2499 | 1999 | https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400,https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400 | WHITE | TRUE | TRUE | DRS-001-S-BLK | S | Black | Silk | 2499 | 1999 | 15 | https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400 |
| Elegant Dress |  | womens-dresses |  |  |  |  |  |  | DRS-001-M-BLK | M | Black | Silk | 2499 | 1999 | 20 |  |
| Elegant Dress |  | womens-dresses |  |  |  |  |  |  | DRS-001-L-BLK | L | Black | Silk | 2499 | 1999 | 18 |  |
| Basic T-Shirt | Simple cotton t-shirt for everyday wear | mens-tshirts | 599 | 499 | https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400 | WHITE | FALSE | TRUE | BSC-001-ONE-WHT | One Size | White | Cotton | 599 | 499 | 100 |  |

## Instructions:

1. **Copy the table above** into Excel (select all and paste)
2. **Ensure column headers** are exactly as shown (case-sensitive)
3. **Create categories first**: Before uploading, manually create these categories:
   - mens-tshirts
   - mens-hoodies
   - womens-dresses
4. **Image URLs**: Use real, publicly accessible image URLs
5. **Variants**: For products with variants, create multiple rows with the same product name
6. **Empty cells**: Leave empty for optional fields or when reusing product data

## Key Points:

- **Product Name**: Same name = same product with different variants
- **Category Slug**: Must exist in database before upload
- **Images**: Comma-separated URLs (no spaces after commas)
- **Theme**: Either "BLACK" or "WHITE" (case-sensitive)
- **Boolean fields**: Use TRUE/FALSE (case-sensitive)
- **Prices**: Numbers only (no currency symbols)
- **Variant SKU**: Should be unique across all products

## Sample Categories to Create First:

```
mens-tshirts - Men's T-Shirts
mens-hoodies - Men's Hoodies
mens-jeans - Men's Jeans
mens-shirts - Men's Shirts
womens-dresses - Women's Dresses
womens-tops - Women's Tops
womens-jeans - Women's Jeans
womens-skirts - Women's Skirts
accessories - Accessories
shoes - Shoes
```

Save as `.xlsx` file and upload through Admin → Bulk Upload.