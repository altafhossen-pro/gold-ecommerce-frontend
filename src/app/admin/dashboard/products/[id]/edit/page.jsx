'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, X, Trash2 } from 'lucide-react'
import ImageUpload from '@/components/Common/ImageUpload'
import toast from 'react-hot-toast'

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const productId = params.id
    
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        description: '',
        category: '',
        brand: '',
        tags: [],
        status: 'draft',
        isActive: true,
        isFeatured: false,
        isBestselling: false,
        isNewArrival: false,
        slug: '',
        featuredImage: '',
        gallery: [],
        specifications: [],
        variants: []
    })

    const [variantForm, setVariantForm] = useState({
        image: '',
        size: '',
        color: '',
        colorCode: '#000000',
        sku: '',
        oldPrice: '',
        currentPrice: '',
        stock: 0
    })

    useEffect(() => {
        fetchCategories()
        fetchProduct()
    }, [productId])

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1/category')
            const data = await response.json()
            if (data.success) {
                setCategories(data.data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchProduct = async () => {
        try {
            setFetching(true)
            const response = await fetch(`http://localhost:5000/api/v1/product/${productId}`)
            const data = await response.json()
            
            if (data.success) {
                const product = data.data
                setFormData({
                    title: product.title || '',
                    shortDescription: product.shortDescription || '',
                    description: product.description || '',
                    category: product.category?._id || product.category || '',
                    brand: product.brand || '',
                    tags: product.tags || [],
                    status: product.status || 'draft',
                    isActive: product.isActive !== undefined ? product.isActive : true,
                    isFeatured: product.isFeatured || false,
                    isBestselling: product.isBestselling || false,
                    isNewArrival: product.isNewArrival || false,
                    slug: product.slug || '',
                    featuredImage: product.featuredImage || '',
                    gallery: product.gallery || [],
                    specifications: product.specifications || [],
                    variants: product.variants || []
                })
            } else {
                toast.error('Failed to fetch product: ' + data.message)
                router.push('/admin/dashboard/products')
            }
        } catch (error) {
            console.error('Error fetching product:', error)
            toast.error('Error fetching product')
            router.push('/admin/dashboard/products')
        } finally {
            setFetching(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleTagsChange = (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        setFormData(prev => ({ ...prev, tags }))
    }

    const addSpecification = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { key: '', value: '', group: '' }]
        }))
    }

    const removeSpecification = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }))
    }

    const updateSpecification = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.map((spec, i) => 
                i === index ? { ...spec, [field]: value } : spec
            )
        }))
    }

    const handleVariantInputChange = (e) => {
        const { name, value } = e.target
        setVariantForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const addVariant = () => {
        if (!variantForm.size || !variantForm.color || !variantForm.currentPrice) {
            toast.error('Please fill in size, color, and current price')
            return
        }

        const newVariant = {
            sku: variantForm.sku || `${formData.title?.toLowerCase().replace(/\s+/g, '-')}-${variantForm.size}-${variantForm.color}`,
            attributes: [
                { name: 'Size', value: variantForm.size, displayValue: variantForm.size },
                { name: 'Color', value: variantForm.color, displayValue: variantForm.color, hexCode: variantForm.colorCode }
            ],
            currentPrice: parseFloat(variantForm.currentPrice),
            originalPrice: variantForm.oldPrice ? parseFloat(variantForm.oldPrice) : null,
            stockQuantity: parseInt(variantForm.stock),
            images: variantForm.image ? [{ url: variantForm.image, isPrimary: true }] : [],
            isActive: true
        }

        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, newVariant]
        }))

        // Reset variant form
        setVariantForm({
            image: '',
            size: '',
            color: '',
            colorCode: '#000000',
            sku: '',
            oldPrice: '',
            currentPrice: '',
            stock: 0
        })
    }

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }))
    }

    const updateVariant = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((variant, i) => 
                i === index ? { ...variant, [field]: value } : variant
            )
        }))
    }

    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-')
        setFormData(prev => ({ ...prev, slug }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch(`http://localhost:5000/api/v1/product/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Product updated successfully!')
                router.push(`/admin/dashboard/products/${productId}`)
            } else {
                toast.error('Failed to update product: ' + data.message)
            }
        } catch (error) {
            console.error('Error updating product:', error)
            toast.error('Error updating product')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={`/admin/dashboard/products/${productId}`}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Product
                        </Link>
                        <div className="border-l border-gray-300 pl-4">
                            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Update product information and settings
                            </p>
                        </div>
                    </div>
                                         <div className="flex items-center space-x-3">
                         <Link
                             href="/admin/dashboard/products"
                             className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                         >
                             View All Products
                         </Link>
                     </div>
                </div>
            </div>

            {/* Form */}
            <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Slug
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={generateSlug}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand
                            </label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                value={formData.tags.join(', ')}
                                onChange={handleTagsChange}
                                placeholder="tag1, tag2, tag3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Short Description
                        </label>
                        <textarea
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Brief description of the product"
                        />
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="6"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            placeholder="Detailed description of the product"
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Images</h2>
                    
                    <div className="space-y-4">
                        <ImageUpload
                            onImageUpload={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                            onImageRemove={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                            currentImage={formData.featuredImage}
                            label="Featured Image"
                        />
                    </div>
                </div>

                {/* Specifications */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-gray-900">Specifications</h2>
                        <button
                            type="button"
                            onClick={addSpecification}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Spec
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.specifications.map((spec, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <input
                                    type="text"
                                    value={spec.key}
                                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                                    placeholder="Key"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    value={spec.value}
                                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                    placeholder="Value"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    value={spec.group}
                                    onChange={(e) => updateSpecification(index, 'group', e.target.value)}
                                    placeholder="Group (optional)"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSpecification(index)}
                                    className="p-2 text-red-600 hover:text-red-800"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Existing Variants */}
                {formData.variants.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Existing Variants</h2>
                        <div className="space-y-4">
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-md font-medium text-gray-900">
                                            {variant.attributes[0]?.value} - {variant.attributes[1]?.value}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
                                            <input
                                                type="number"
                                                value={variant.currentPrice}
                                                onChange={(e) => updateVariant(index, 'currentPrice', parseFloat(e.target.value))}
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                                            <input
                                                type="number"
                                                value={variant.originalPrice || ''}
                                                onChange={(e) => updateVariant(index, 'originalPrice', e.target.value ? parseFloat(e.target.value) : null)}
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                            <input
                                                type="number"
                                                value={variant.stockQuantity}
                                                onChange={(e) => updateVariant(index, 'stockQuantity', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add New Variants */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Add New Variants</h2>
                    <p className="text-sm text-gray-600 mb-4">Add new variants to the product.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                            <input
                                type="text"
                                name="size"
                                value={variantForm.size}
                                onChange={handleVariantInputChange}
                                placeholder="S, M, L, XL"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    name="color"
                                    value={variantForm.color}
                                    onChange={handleVariantInputChange}
                                    placeholder="Red, Blue, Green"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="color"
                                    name="colorCode"
                                    value={variantForm.colorCode}
                                    onChange={handleVariantInputChange}
                                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                    title="Pick color"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Price *</label>
                            <input
                                type="number"
                                name="currentPrice"
                                value={variantForm.currentPrice}
                                onChange={handleVariantInputChange}
                                placeholder="99.99"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Old Price</label>
                            <input
                                type="number"
                                name="oldPrice"
                                value={variantForm.oldPrice}
                                onChange={handleVariantInputChange}
                                placeholder="129.99"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input
                                type="text"
                                name="sku"
                                value={variantForm.sku}
                                onChange={handleVariantInputChange}
                                placeholder="Auto-generated or custom SKU"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={variantForm.stock}
                                onChange={handleVariantInputChange}
                                placeholder="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={addVariant}
                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Variant
                            </button>
                        </div>
                    </div>

                    {/* Variant Image Upload */}
                    <div className="mb-6">
                        <ImageUpload
                            onImageUpload={(url) => setVariantForm(prev => ({ ...prev, image: url }))}
                            onImageRemove={() => setVariantForm(prev => ({ ...prev, image: '' }))}
                            currentImage={variantForm.image}
                            label="Variant Image (Optional)"
                        />
                    </div>
                </div>

                {/* Product Flags */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Product Flags</h2>
                    
                    <div className="space-y-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                        
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                        </label>
                        
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isBestselling"
                                checked={formData.isBestselling}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Bestselling Product</span>
                        </label>
                        
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isNewArrival"
                                checked={formData.isNewArrival}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">New Arrival</span>
                        </label>
                    </div>
                                 </div>

                 {/* Submit Section */}
                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                         <div className="text-sm text-gray-500">
                             Make sure all required fields are filled before updating the product.
                         </div>
                         <div className="flex items-center space-x-3">
                             <Link
                                 href={`/admin/dashboard/products/${productId}`}
                                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                             >
                                 Cancel
                             </Link>
                             <button
                                 type="submit"
                                 disabled={loading}
                                 className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                             >
                                 <Save className="h-4 w-4 mr-2" />
                                 {loading ? 'Updating...' : 'Update Product'}
                             </button>
                         </div>
                     </div>
                 </div>

             </form>
         </div>
     )
 }
