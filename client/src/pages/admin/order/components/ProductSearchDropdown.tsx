import React from 'react'
import { Loader2, ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductSearchDropdownProps {
    searchResults: Product[]
    isSearching: boolean
    searchError: string | null
    hasSearched: boolean
    searchQuery: string
    onProductSelect: (product: Product) => void
    isVisible: boolean
}

export default function ProductSearchDropdown({
    searchResults,
    isSearching,
    searchError,
    hasSearched,
    searchQuery,
    onProductSelect,
    isVisible
}: ProductSearchDropdownProps) {
    // Format giá tiền
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    if (!isVisible || !searchQuery.trim()) {
        return null
    }

    return (
        <div className="search-dropdown">
            <div className="p-0">
                {/* Loading state */}
                {isSearching && (
                    <div className="search-loading">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2">Đang tìm kiếm...</span>
                    </div>
                )}

                {/* Error state */}
                {searchError && !isSearching && (
                    <div className="search-error">
                        <Package className="h-6 w-6 mr-2" />
                        <span>{searchError}</span>
                    </div>
                )}

                {/* No results */}
                {hasSearched && !isSearching && !searchError && searchResults.length === 0 && (
                    <div className="search-no-results">
                        <Package className="h-6 w-6 mr-2" />
                        <span>Không tìm thấy sản phẩm nào</span>
                    </div>
                )}

                {/* Search results */}
                {searchResults.length > 0 && !isSearching && (
                    <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((product) => (
                            <div
                                key={product._id}
                                className="search-result-item"
                                onClick={() => onProductSelect(product)}
                            >
                                {/* Product Image */}
                                <img
                                    src={product.product_thumb}
                                    alt={product.product_name}
                                    className="search-result-image"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = '/placeholder-product.png'
                                    }}
                                />

                                {/* Product Info */}
                                <div className="search-result-info">
                                    <h4 className="search-result-name">
                                        {product.product_name}
                                    </h4>
                                    <p className="search-result-category">
                                        {product.product_category?.category_name || 'Chưa phân loại'}
                                    </p>
                                    <p className="search-result-price">
                                        {product.product_basePrice > 0 ? (
                                            formatPrice(product.product_basePrice)
                                        ) : (
                                            (() => {
                                                const prices = product.product_attribute
                                                    ?.map(attr => Number(attr.price))
                                                    .filter(p => !isNaN(p)) || [];

                                                if (prices.length === 0) return formatPrice(0);

                                                const minPrice = Math.min(...prices);
                                                const maxPrice = Math.max(...prices);

                                                return minPrice === maxPrice
                                                    ? formatPrice(minPrice)
                                                    : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
                                            })()
                                        )}
                                    </p>

                                </div>


                            </div>
                        ))}
                    </div>
                )}

                {/* Results count */}
                {searchResults.length > 0 && !isSearching && (
                    <div className="search-results-count">
                        Tìm thấy {searchResults.length} sản phẩm
                    </div>
                )}
            </div>
        </div>
    )
}
