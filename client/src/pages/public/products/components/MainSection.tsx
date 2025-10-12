import { fetchProductsAPIs, fetchProductsAPIsByCategory } from "@/apis/product.apis";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { useEffect, useState, useCallback } from "react";
import ProductCard from "./ProductCard";
import { fetchCategoriesAPIs } from "@/apis/category.apis";
import { fetchEffect, fetchTaste } from "@/apis/attribute.apis";
import SidebarFilter from "./Sidebar";
import Pagination from "./Pagination";
import LoadingSpinner from "./LoadingSpinner";
import { fetchTeaCategoryAPIs } from "@/apis/tea.category.apis";
import { useParams } from "react-router-dom";

interface FilterState {
    categories: string[];
    priceRange: [number, number];
    tastes: string[];
    effects: string[];
    sortBy: string;
}

const TeaProductsLayout = () => {
    //data
    const [teas, setTeas] = useState<Product[]>([]);
    const [filteredTeas, setFilteredTeas] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [teaCategories, setTeaCategories] = useState<TeaCategory[]>([]);
    const [tastes, setTastes] = useState<Taste[]>([]);
    const [effects, setEffects] = useState<Effect[]>([]);

    // Pagination
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const size = 12;

    // Filter
    const [filter, setFilter] = useState<FilterState>({
        categories: [],
        priceRange: [0, 7000000],
        tastes: [],
        effects: [],
        sortBy: ""
    });

    const { slug } = useParams();

    // Fetch initial data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes, tastesRes, effectsRes, teaCategoriesRes] = await Promise.all([
                fetchProductsAPIsByCategory(slug, { page: 1, size: 1000, search: "" }), // Fetch all products for client-side filtering
                fetchCategoriesAPIs(),
                fetchTaste(),
                fetchEffect(),
                fetchTeaCategoryAPIs()
            ]);
            setTeas(productsRes.data);
            setFilteredTeas(productsRes.data);
            setTotalProducts(productsRes.total);
            setCategories(categoriesRes.data);
            setTastes(tastesRes.data);
            setEffects(effectsRes.data);
            setTeaCategories(teaCategoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter and sort products
    const applyFilters = useCallback(() => {
        let filtered = [...teas];

        // Filter by teaCategories
        if (filter.categories.length > 0) {
            filtered = filtered.filter(tea => {
                // Nếu tea.product_tea_category là mảng id (string)
                if (Array.isArray((tea as any).product_tea_category)) {
                    // Map id sang tên từ teaCategories
                    const teaCatNames = ((tea as any).product_tea_category as string[])
                        .map(id => {
                            const found = teaCategories.find(tc => tc._id === id);
                            return found ? found.tea_category_name : null;
                        })
                        .filter(Boolean);
                    return teaCatNames.some(name => filter.categories.includes(name!));
                }
                return false;
            });
        }

        // Filter by price range
        filtered = filtered.filter(tea =>
            tea.product_basePrice >= filter.priceRange[0] &&
            tea.product_basePrice <= filter.priceRange[1]
        );

        // Filter by tastes (assuming product has taste field)
        if (filter.tastes.length > 0) {
            // This would need backend support for taste filtering
            // For now, we'll skip this filter
        }

        // Filter by effects (assuming product has effects field)
        if (filter.effects.length > 0) {
            // This would need backend support for effects filtering
            // For now, we'll skip this filter
        }

        // Sort products
        if (filter.sortBy) {
            switch (filter.sortBy) {
                case 'price-asc':
                    filtered.sort((a, b) => a.product_basePrice - b.product_basePrice);
                    break;
                case 'price-desc':
                    filtered.sort((a, b) => b.product_basePrice - a.product_basePrice);
                    break;
                case 'name-asc':
                    filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
                    break;
                case 'name-desc':
                    filtered.sort((a, b) => b.product_name.localeCompare(a.product_name));
                    break;
                case 'rating-desc':
                    filtered.sort((a, b) => b.product_ratingAverage - a.product_ratingAverage);
                    break;
                default:
                    break;
            }
        }

        setFilteredTeas(filtered);
        setTotalProducts(filtered.length);
        setTotalPages(Math.ceil(filtered.length / size));
        setPage(1); // Reset to first page when filters change
    }, [teas, filter, size]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Get current page products
    const getCurrentPageProducts = useCallback(() => {
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        return filteredTeas.slice(startIndex, endIndex);
    }, [filteredTeas, page, size]);

    const currentProducts = getCurrentPageProducts();

    // Handle filter changes
    const handleFilterChange = (newFilter: Partial<FilterState>) => {
        setFilter(prev => ({ ...prev, ...newFilter }));
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };



    return (
        <div className="min-h-screen ">
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar - Hidden on mobile, shown on desktop */}
                    <div className="lg:w-80 xl:w-96">
                        <div className="lg:sticky lg:top-4">
                            <SidebarFilter
                                categories={categories}
                                effects={effects}
                                tastes={tastes}
                                filter={filter}
                                teaCategories={teaCategories}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-gray-700 text-sm">
                                    Hiển thị {currentProducts.length} trong tổng số {totalProducts} kết quả
                                    {page > 1 && ` (Trang ${page}/${totalPages})`}
                                </p>
                            </div>
                            <Select value={filter.sortBy} onValueChange={(value) => handleFilterChange({ sortBy: value })}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sắp xếp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Sắp xếp theo</SelectLabel>
                                        <SelectItem value="name-asc">Tên A-Z</SelectItem>
                                        <SelectItem value="name-desc">Tên Z-A</SelectItem>
                                        <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                                        <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                                        <SelectItem value="rating-desc">Đánh giá cao nhất</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Loading State */}
                        {loading && <LoadingSpinner />}

                        {/* Products Grid */}
                        {!loading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                                {currentProducts.length === 0 ? (
                                    <div className="col-span-full text-center py-16">
                                        <p className="text-gray-400 text-xl">Không có sản phẩm nào được tìm thấy</p>
                                        <p className="text-gray-500 text-sm mt-2">Thử điều chỉnh bộ lọc để xem thêm sản phẩm</p>
                                    </div>
                                ) : (
                                    currentProducts.map((tea, index) => (
                                        <div key={tea._id} className="animate-fade-in">
                                            <ProductCard tea={tea} index={index} />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && (
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            <style >{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 22px;
                    width: 22px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #10b981 60%, #34d399 100%);
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 4px 12px rgba(16,185,129,0.15);
                    transition: background 0.3s;
                }

                .slider::-moz-range-thumb {
                    height: 22px;
                    width: 22px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #10b981 60%, #34d399 100%);
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 4px 12px rgba(16,185,129,0.15);
                    transition: background 0.3s;
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s cubic-bezier(.4,0,.2,1) forwards;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default TeaProductsLayout;