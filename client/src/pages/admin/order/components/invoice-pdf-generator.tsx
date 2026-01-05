
import { useState, useEffect } from "react"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer, Font, Image } from "@react-pdf/renderer"
import dayjs from "dayjs"
import { generateBarcodeDataUrl, generateOrderUrl } from "./barcode-generator"
import { OrderTab } from "../types"
import shanbuLeft from "@/assets/shanbu-left.png"
import shanbuRight from "@/assets/shanbu-right.png"
const paddingItem = 30

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: "normal",
      fontStyle: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
      fontStyle: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

// PDF Styles - Optimized for thermal printer (58mm width)
const styles = StyleSheet.create({
  page: {
    padding: 8,
    fontFamily: "Roboto",
    fontSize: 8,
    width: 220, // 58mm thermal paper width (approximately)
    height: 800, // Fixed height for thermal receipt
  },
  header: {
    marginBottom: 1,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  logo: {
    width: 50,
  },
  logo2: {
    width: 90,
  },
  companyInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  companyInfo: {
    fontSize: 7,
    color: "#000",
    fontWeight: "500"
  },
  serviceHotline: {
    fontSize: 8,
    color: "#000",
    flexDirection: "row",
    alignItems: "center"
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 5,
  },
  invoiceDetails: {
    marginBottom: 8,
    alignItems: "center",
  },
  invoiceNumber: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  invoiceDate: {
    fontSize: 8,
    textAlign: "center",
  },
  customerSection: {
    marginBottom: 8,
    fontSize: 8,
  },
  customerRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  customerLabel: {
    fontSize: 8,
    fontWeight: "bold",
    marginRight: 0.5,
  },
  customerValue: {
    fontSize: 8,
    fontWeight: "700",
  },
  staffInfo: {
    fontSize: 8,
    marginTop: 3,
  },
  tableContainer: {
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 3,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  tableHeaderText1: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "left",
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  productColumn: {
    flex: 3,
  },
  priceColumn: {
    flex: 1,
  },
  totalColumn: {
    flex: 1,
  },
  orderContainer: {
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  serviceItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    paddingLeft: paddingItem,
  },
  serviceNameContainer: {
    flex: 3,
  },
  serviceItemText: {
    fontSize: 6,
    textAlign: "left",
  },
  servicePriceContainer: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 20,
  },
  serviceItemPrice: {
    fontSize: 6,
    textAlign: "right",
  },
  serviceTotalContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  serviceItemTotal: {
    fontSize: 6,
    textAlign: "right",
  },
  servicePriceText: {
    flex: 1,
    fontSize: 7,
    textAlign: "center",
    paddingHorizontal: 1,
  },
  serviceTotalText: {
    flex: 1,
    fontSize: 7,
    textAlign: "center",
    paddingHorizontal: 1,
  },
  orderNote: {
    fontSize: 7,
    fontStyle: "italic",
    marginLeft: 4,
    paddingLeft: paddingItem - 2
  },
  orderTotalRow: {
    flexDirection: "row",
    marginTop: 3,
    paddingTop: 2,
    alignItems: "center",
    paddingLeft: paddingItem - 1,
  },
  orderTotalLabel: {
    fontSize: 6,
    fontWeight: "bold",
    paddingLeft: 4,
    alignItems: "center",
  },
  orderTotalLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    paddingTop: 4,
    borderBottomColor: "#000",
    borderStyle: "dashed",
    marginHorizontal: 3,
    alignSelf: "center",
  },
  orderTotalAmount: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "right",
  },
  summarySection: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  summaryRow2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    paddingHorizontal: 2,
    paddingLeft: 15
  },
  summaryLabel3: {
    fontSize: 7,
    paddingLeft: paddingItem - 1
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: "bold",
    paddingLeft: paddingItem - 1
  },
  summaryLabel2: {
    fontSize: 8,
    paddingLeft: paddingItem - 1
  },
  summaryValue: {
    fontSize: 7,
  },
  summaryValue2: {
    fontSize: 7,
    fontWeight: "bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  grandTotalLabel: {
    fontSize: 8,
    fontWeight: "bold",
    paddingLeft: paddingItem - 1

  },
  grandTotalValue: {
    fontSize: 7,
    fontWeight: "bold",
  },
  totalInWords: {
    fontSize: 7,
    fontStyle: "italic",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  noteSection: {
    marginTop: 4,
    paddingHorizontal: 4,
    paddingTop: 2
  },
  noteText: {
    fontSize: 7,
    marginBottom: 2,
    textAlign: "left",
    fontWeight: "bold"
  },
  thankYouText: {
    fontSize: 7,
    fontStyle: "italic",
    marginTop: 4,
    textAlign: "center",
  },
  barcodeSection: {
    alignItems: "center",
  },
  barcodeImage: {
    width: "60%",
    height: 60,
    marginBottom: 3,
  },
  barcodeText: {
    fontSize: 6,
    color: "#666",
  },
  textLigit: {
    fontSize: 7,
    fontWeight: "bold"
  },
  // New styles for thermal receipt layout
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 4,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderStyle: "dashed",
    marginVertical: 2,
  }
})



// PDF Document Component
const InvoicePDF = ({ orderTab, companyAddress, user, trackingId }: {
  orderTab: OrderTab,
  companyAddress: string[],
  user: any,
  trackingId?: string
}) => {
  const formatDate = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date()
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day} tháng ${month} năm ${year}`
  }


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  const numberToWords = (num: number): string => {
    const ones = [
      "",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín",
      "mười",
      "mười một",
      "mười hai",
      "mười ba",
      "mười bốn",
      "mười lăm",
      "mười sáu",
      "mười bảy",
      "mười tám",
      "mười chín",
    ]
    const tens = [
      "",
      "",
      "hai mười",
      "ba mười",
      "bốn mười",
      "năm mười",
      "sáu mười",
      "bảy mười",
      "tám mười",
      "chín mười",
    ]
    const scales = ["", "nghìn", "triệu", "tỷ"]

    if (num === 0) return "không đồng"

    const convertGroup = (n: number): string => {
      let result = ""
      const hundreds = Math.floor(n / 100)
      const remainder = n % 100

      if (hundreds > 0) {
        result += ones[hundreds] + " trăm"
        if (remainder > 0) result += " "
      }

      if (remainder >= 20) {
        const tensDigit = Math.floor(remainder / 10)
        const onesDigit = remainder % 10
        result += tens[tensDigit]
        if (onesDigit > 0) result += " " + ones[onesDigit]
      } else if (remainder > 0) {
        result += ones[remainder]
      }

      return result
    }

    let result = ""
    let scaleIndex = 0
    let tempNum = num

    while (tempNum > 0) {
      const group = tempNum % 1000
      if (group > 0) {
        const groupText = convertGroup(group)
        if (scaleIndex > 0) {
          result = groupText + " " + scales[scaleIndex] + " " + result
        } else {
          result = groupText
        }
      }
      tempNum = Math.floor(tempNum / 1000)
      scaleIndex++
    }

    return result.trim() + " đồng"
  }

  // Calculate totals
  const calculateOrderTotal = () => {
    return orderTab.products.reduce((total, product) => total + product.total, 0)
  }

  const totalAmount = calculateOrderTotal()
  const deliveryFee = 0
  const discountAmount = orderTab?.discountAmount || 0
  const paymentDiscount = 0
  const grandTotal = totalAmount + deliveryFee - discountAmount - paymentDiscount

  // Tạo mã vạch và URL cho đơn hàng
  const orderId = orderTab.id || orderTab.name || 'DEFAULT'
  const barcodeDataUrl = generateBarcodeDataUrl(orderId)
  // const orderUrl = generateOrderUrl(orderId)

  if (!Document || !Page || !Text || !View) {
    return null
  }


  return (
    <Document>
      <Page size={[220, 800]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image source={shanbuLeft} style={styles.logo} />
            <Image source={shanbuRight} style={styles.logo2} />
          </View>
          <View style={styles.divider} />

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>

              <Text style={styles.companyInfo}>{companyAddress[0]}</Text>
              <Text style={styles.companyInfo}>{companyAddress[1]}</Text>
            </View>
            <View style={styles.serviceHotline}>
              <View >
                <Text>service </Text>
                <Text>hotline</Text>
              </View>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                {user.companyBranch.contact}
              </Text>
            </View>
          </View>


          <View style={styles.divider} />

          <Text style={styles.invoiceTitle}>HÓA ĐƠN BÁN HÀNG</Text>

          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceNumber}>Đơn Hàng #{trackingId}</Text>
            <Text style={styles.invoiceDate}>Ngày {formatDate()}</Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* Customer Information */}
        {orderTab.customerInfo && (
          <View style={styles.customerSection}>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Khách hàng:</Text>
              <Text style={styles.customerValue}>{orderTab.customerInfo.name.toUpperCase()}</Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Địa chỉ:</Text>
              <Text style={styles.customerValue}>{orderTab.customerInfo.address}</Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Điện thoại:</Text>
              <Text style={styles.customerValue}>{orderTab.customerInfo.phone}</Text>
            </View>
            <Text style={styles.staffInfo}>Nhân viên bán hàng: SHANBU STAFF </Text>
          </View>
        )}


        {/* Service Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText1, styles.productColumn]}>SẢN PHẨM</Text>
            <Text style={[styles.tableHeaderText, styles.priceColumn]}>ĐƠN GIÁ</Text>
            <Text style={[styles.tableHeaderText, styles.totalColumn]}>THÀNH TIỀN</Text>
          </View>

          {/* Product Items */}
          {orderTab.products.map((product, index) => (
            <View key={product._id + index} style={styles.orderContainer}>
              {/* Product Title */}
              <Text style={styles.productTitle}>
                {index + 1}. {product.product_name.toUpperCase()}
                {product.attributeDisplayName && ` | ${product.selectedAttributes[0].name === "package" ? "Túi" : "Hộp"} (${product.selectedAttributes[0].unit})`}
              </Text>

              {/* Product Details */}
              <View style={styles.serviceItemRow}>
                <View style={styles.serviceNameContainer}>
                  <Text style={styles.serviceItemText}>
                    • Số lượng: {product.quantity}
                  </Text>
                </View>
                <View style={styles.servicePriceContainer}>
                  <Text style={styles.serviceItemPrice}>
                    {formatCurrency(product.price)}
                  </Text>
                </View>
                <View style={styles.serviceTotalContainer}>
                  <Text style={styles.serviceItemTotal}>
                    {formatCurrency(product.total)}
                  </Text>
                </View>
              </View>

              {/* Product Total */}
              <View style={styles.orderTotalRow}>
                <Text style={styles.orderTotalLabel}>TỔNG TIỀN</Text>
                <View style={styles.orderTotalLine} />
                <Text style={styles.orderTotalAmount}>
                  {formatCurrency(product.total)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>TỔNG TIỀN SẢN PHẨM</Text>
            <Text style={styles.summaryValue2}>{formatCurrency(totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel2}>GIẢM GIÁ KHÁC</Text>
            <Text style={styles.summaryValue}>{formatCurrency(discountAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel2}>PHÍ GIAO HÀNG</Text>
            <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel2}>ĐÃ THANH TOÁN</Text>
            <Text style={styles.summaryValue}>{formatCurrency(paymentDiscount)}</Text>
          </View>



          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>DƯ NỢ CÒN LẠI </Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(grandTotal)}
            </Text>
          </View>
        </View>

        <Text style={styles.totalInWords}>
          Tổng thanh toán bằng chữ:{" "}
          <Text style={styles.textLigit}>
            {numberToWords(grandTotal).charAt(0).toUpperCase() + numberToWords(grandTotal).slice(1)}.</Text>
        </Text>

        <View style={styles.dottedLine} />
        <View style={styles.divider} />

        {/* Barcode Section */}
        <View style={styles.barcodeSection}>
          {barcodeDataUrl ? (
            <>
              <Image src={barcodeDataUrl} style={styles.barcodeImage} />
            </>
          ) : (
            <Text style={{ fontSize: 12, textAlign: 'center' }}>|||||||||||||||||||||||</Text>
          )}
        </View>
        <View style={styles.divider} />

        {/* Notes */}
        <View style={styles.noteSection}>
          {orderTab.customerInfo?.note && (
            <Text style={styles.noteText}>
              Ghi chú đơn hàng: {orderTab.customerInfo.note}
            </Text>
          )}
          <Text style={styles.noteText}>
            * Đơn hàng của quý khách sẽ được xử lý trong thời gian sớm nhất
          </Text>
          <Text style={styles.noteText}>
            * Lưu ý: Trong trường hợp đơn hàng phát sinh thêm thời gian xử lí hoàn thiện sản phẩm, Shanbu Shop sẽ chủ động liên hệ thông báo tới quý khách
          </Text>
          <Text style={styles.noteText}>
            * Giữ lại hóa đơn để đối chiếu khi nhận hàng
          </Text>
          <Text style={styles.noteText}>
            ** Giao hàng tại địa chỉ: {orderTab.customerInfo?.address || "Tại cửa hàng"}
          </Text>
        </View>

        {/* Barcode Section */}

      </Page>
    </Document>
  )
}

// Main Component - Đã loại bỏ UI button và chỉ trả về PDFDownloadLink
interface InvoicePDFGeneratorProps {
  orderTab: OrderTab
  onDownload?: () => void,
  setIsShowInvoice?: React.Dispatch<React.SetStateAction<boolean>>,
  companyAddress?: string[]
  trackingId?: string
  user?: any
}

export default function InvoicePDFGenerator({
  orderTab,
  onDownload,
  setIsShowInvoice,
  companyAddress = ["Tea Shop", "123 Đường ABC, Quận XYZ"],
  trackingId,
  user = { companyBranch: { contact: "0123456789" } }
}: InvoicePDFGeneratorProps) {
  const [isClient, setIsClient] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [printed, setPrinted] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handlePrintSuccess = () => {
    // toast.success("Hóa đơn đã được in thành công!")
    if (onDownload) onDownload()
    if (setIsShowInvoice) setIsShowInvoice(false)
  }

  useEffect(() => {
    if (url && !printed) {
      setPrinted(true)

      const iframe = document.createElement("iframe")
      iframe.style.display = "none"
      iframe.src = url
      document.body.appendChild(iframe)

      iframe.onload = () => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        handlePrintSuccess()


      }
    }
  }, [url, printed])

  if (!isClient || !orderTab?.products?.length) return null

  return (
    <PDFDownloadLink
      document={<InvoicePDF orderTab={orderTab} companyAddress={companyAddress} user={user} trackingId={trackingId} />}
      fileName={`hoa-don-${orderTab?.name}.pdf`}
    >
      {({ loading, url }) => {
        if (url && !loading && !printed) {
          setUrl(url) // chỉ set state, không in ở đây
        }
        return null
      }}
    </PDFDownloadLink>
  )
}


