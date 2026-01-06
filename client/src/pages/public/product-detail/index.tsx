"use client"

import { useEffect, useState } from "react"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNavigate, useParams } from "react-router-dom"
import { fetchProductBySlug, fetchRelatedProducts } from "@/apis/product.apis"
import { ProductAttribute } from "@/pages/admin/products/types/enum"
import { toast } from "react-toastify"
import { addProductToCart } from "@/utils/cart"

export function TeaProductDetail() {
    const { slug } = useParams()
    //data
    const [tea, setTea] = useState<Product | null>()
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

    //
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [selectedAttribute, setSelectedAttribute] = useState<{
        name: string
        unit: string
        price: string
        image?: string
    } | null>(null)


    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [productResponse, relatedProductsResponse] = await Promise.all([
                fetchProductBySlug(slug),
                fetchRelatedProducts(slug)
            ])

            setTea(productResponse.data)
            setRelatedProducts(relatedProductsResponse.data.relatedProducts)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
        finally {
            setLoading(false)
        }
    }

    const navigate = useNavigate()

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = () => {
        if (!tea) {
            toast.error('Không tìm thấy thông tin sản phẩm!')
            return
        }
        const result = addProductToCart(tea, quantity, selectedAttribute)


        if (result.success) {
            toast.success(result.message)
            // Reset quantity về 1 sau khi thêm thành công
            setQuantity(1)

            navigate('/gio-hang')
        } else {
            toast.error(result.message)
        }
    }

    if (loading) return <div>Loading...</div>



    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Product Images */}
                <div className="space-y-4">
                    <div className="relative max-w-lg mx-auto">
                        <div className="aspect-square relative overflow-hidden rounded-xl bg-muted shadow-lg">
                            <img
                                src={tea?.product_images[selectedImage] || "/placeholder.svg"}
                                alt={tea?.product_name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                        {/* Image indicator */}
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {selectedImage + 1} / {tea?.product_images?.length || 0}
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto justify-center">
                        {tea?.product_images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all duration-300 hover:border-primary ${selectedImage === index ? "border-primary shadow-md" : "border-border hover:border-gray-300"
                                    }`}
                            >
                                <div className="w-full h-full overflow-hidden rounded-lg">
                                    <img
                                        src={image || "/placeholder.svg"}
                                        alt={`${tea?.product_name} ${index + 1}`}
                                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <Badge variant="secondary" className="mb-2">
                            {tea.product_category.category_name}
                        </Badge>
                        <h1 className="text-3xl font-bold mb-2">{tea.product_name}</h1>
                        <p className="text-muted-foreground mb-4">{tea.product_category.category_name}</p>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(tea.product_ratingAverage) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="font-medium">{tea.product_ratingAverage}</span>
                            {/* <span className="text-muted-foreground">({tea?.reviews.length} đánh giá)</span> */}
                        </div>

                        <p className="text-muted-foreground mb-6">{tea.product_description}</p>

                        <div className="text-2xl font-bold text-primary mb-6">
                            {tea.product_attribute && tea.product_attribute.length > 0 ? (
                                selectedAttribute ?
                                    <>
                                        <div className="text-sm italic text-[#ff4757]">
                                            {selectedAttribute.name === ProductAttribute.BOX ? (
                                                <div>
                                                    Hộp trà {selectedAttribute.unit}
                                                </div>
                                            ) :
                                                <div className="">
                                                    Túi trà {selectedAttribute.unit}
                                                </div>}

                                        </div>
                                        <div className="text-[#ff6348]">
                                            {formatPrice(+selectedAttribute.price)}
                                        </div>
                                    </>
                                    :
                                    <div className=" flex gap-2 items-center text-[#ff6348]">
                                        <div>
                                            {formatPrice(+tea.product_attribute.sort((a, b) => +a.price - +b.price)[0].price)}
                                        </div>
                                        <div className="">
                                            -
                                        </div>
                                        <div>
                                            {formatPrice(+tea.product_attribute.sort((a, b) => +a.price - +b.price)[tea.product_attribute.length - 1].price)}
                                        </div>

                                    </div>) :
                                <div className="text-[#ff6348]">
                                    {formatPrice(tea.product_basePrice)}
                                </div>
                            }
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center border rounded-md">
                            <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                -
                            </Button>
                            <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                            <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)}>
                                +
                            </Button>
                        </div>
                    </div>
                    {tea.product_attribute && tea.product_attribute.length > 0 && (
                        <>

                            <div className="flex gap-5 items-center">
                                <div className="">
                                    Bao bì:
                                </div>
                                {tea.product_attribute.map((item, index) => (
                                    <div key={index} className={"flex gap-4 mt-2 p-2 rounded-sm hover:border border-[#ff6348] cursor-pointer " + (selectedAttribute === item ? "border border-[#ff6348]" : "")} onClick={() => {
                                        if (selectedAttribute === item) {
                                            setSelectedAttribute(null)
                                            return
                                        }

                                        setSelectedAttribute(item)
                                        if (item.image) {
                                            setSelectedImage(
                                                tea.product_images.findIndex((img) => img === item.image)
                                            )
                                        }
                                    }}>
                                        <div className='flex gap-4 items-center '>
                                            {item.name === ProductAttribute.BOX ? (
                                                <img src="/icon/box.png" alt="" className="w-10 h-10" />
                                            ) : (
                                                <div className="relative w-10 h-10 flex items-center justify-center">
                                                    <img src="/icon/bag.png" alt="" className="w-10 h-10 " />
                                                    <Badge className="absolute inset-0 flex items-center hover:bg-transparent font-bold justify-center bg-transparent text-black text-[7px]">
                                                        {item.unit}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="flex gap-4 w-[30px]">
                        <Button size="lg" className="flex-1" onClick={addToCart} disabled={selectedAttribute === null}>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Giỏ hàng
                        </Button>
                        <Button size="lg" onClick={addToCart} disabled={selectedAttribute === null} className="flex-1 bg-[#f57547] hover:bg-[#ff7f50]">
                            <ShoppingCart className="w-5 h-5 mr-2 " />
                            Mua ngay
                        </Button>
                    </div>
                </div>
            </div>

            {/* Product Details Tabs */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <Tabs defaultValue="description" className="w-full">
                        <div className="flex justify-center">
                            <TabsList className="grid w-auto grid-cols-3 gap-8" >
                                <TabsTrigger value="description">MÔ TẢ</TabsTrigger>
                                <TabsTrigger value="additional-info">THÔNG TIN BỔ SUNG</TabsTrigger>
                                <TabsTrigger value="reviews">ĐÁNH GIÁ (5)</TabsTrigger>
                            </TabsList>
                        </div>


                        <TabsContent value="description" className="mt-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold mb-4">Mô tả sản phẩm</h3>
                                <div className="text-muted-foreground leading-relaxed">
                                    {tea?.product_description ? (
                                        <p>{tea.product_description}</p>
                                    ) : (
                                        <p>Chưa có mô tả cho sản phẩm này.</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="additional-info" className="mt-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold mb-4">Thông tin bổ sung</h3>
                                {tea?.product_brewing && tea.product_brewing.length > 0 ? (
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Hướng dẫn pha chế:</h4>
                                        <ul className="space-y-3">
                                            {tea.product_brewing?.map((step, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-muted-foreground">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Chưa có thông tin bổ sung cho sản phẩm này.</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Đánh giá từ khách hàng</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-medium">4.2/5</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Sample reviews */}
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    <AvatarFallback>N</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Nguyễn Văn A</h4>
                                                        <span className="text-sm text-muted-foreground">15/12/2024</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < 5 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-muted-foreground">Sản phẩm rất tốt, chất lượng cao và giao hàng nhanh!</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    <AvatarFallback>T</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Trần Thị B</h4>
                                                        <span className="text-sm text-muted-foreground">12/12/2024</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-muted-foreground">Trà có hương vị thơm ngon, đóng gói cẩn thận.</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    <AvatarFallback>L</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Lê Văn C</h4>
                                                        <span className="text-sm text-muted-foreground">10/12/2024</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-muted-foreground">Chất lượng ổn, sẽ mua lại lần sau.</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts && relatedProducts?.map((product) => (
                        <Card key={product._id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="aspect-square relative overflow-hidden rounded-lg mb-4 bg-muted">
                                    <img
                                        src={product.product_thumb || "/placeholder.svg?height=200&width=200&query=tea product"}
                                        alt={product.product_name}

                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <Badge variant="secondary" className="mb-2 text-xs">
                                    {product.product_category.category_name}
                                </Badge>
                                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.product_name}</h3>
                                <div className="flex items-center gap-1 mb-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < Math.floor(product.product_ratingAverage) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium">{product.product_ratingAverage}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-primary">{
                                        product.product_attribute && product.product_attribute.length > 0 ? (
                                            formatPrice(+product.product_attribute.sort((a, b) => +a.price - +b.price)[0].price)
                                        ) : (
                                            formatPrice(+product.product_basePrice)
                                        )
                                    }</span>
                                    <Button size="sm" variant="outline">
                                        <ShoppingCart className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
