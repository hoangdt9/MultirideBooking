import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from "react-native";
import axiosClient from "../../services/Api/axiosClient"; // Đảm bảo đường dẫn chính xác
import { ImageSourcePropType } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack"; // Import StackNavigationProp
import { RootStackParamList } from "../../screens/App.TicketBookingScreen/index";
import { setTicketInfo, Ticket } from "../../utils/AsyncStorage";

interface PopupProps {
  isVisible: boolean; // Điều khiển hiển thị modal
  onClose: () => void; // Hàm để đóng modal
  // Thêm các props sau đây
  showDialog: boolean;
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
  paymentStatus: string;
  value?: string;
  appTransId?: string;
  statusPay?: string;
  IdTickets?: string;
  dataTickes?: any;
}

const Popup: React.FC<PopupProps> = ({
  isVisible,
  appTransId,
  onClose,
  paymentStatus,
  value,
  IdTickets,
  dataTickes,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const fadeAnim = new Animated.Value(0); // Điều khiển opacity
  const [StatusTitle, setStatusTitle] = useState<string>(""); // Trạng thái thanh toán
  const [Describe, setDescribe] = useState<string>(""); // Trạng thái thanh toán
  const [InvoiceCode, setInvoiceCode] = useState<string>(""); // Trạng thái thanh toán
  const [buttonText, setButtonText] = useState<string>("Đóng"); // Văn bản của nút
  const [imageSource, setImageSource] = useState<ImageSourcePropType | null>(
    null
  );

  const { trip, seatNumber, _id } = dataTickes;
  const { route, departureTime } = trip;
  const { startProvince, endProvince } = route;

  const ticket: Ticket = {
    id: _id,
    status: paymentStatus,
    route: `${startProvince} - ${endProvince}`,
    departureTime: departureTime,
    seat: seatNumber?.[0],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Tăng opacity từ 0 lên 1
      duration: 3000, // Thời gian hiệu ứng fade
      useNativeDriver: true,
    }).start(); // Bắt đầu hiệu ứng fade
  }, [fadeAnim]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (value === "OFFLINEPAYMENT" && paymentStatus === "PAYMENTPENDING") {
      // Trường hợp thanh toán offline và đang chờ thanh toán
      setStatusTitle("Đặt vé thành công");
      setDescribe("Vui lòng thanh toán tại bến xe");
      setImageSource(require("../../assets/tick.gif"));
      setButtonText("Xem vé của bạn"); // Cập nhật text nút
      console.log("Updating ticket status for Id:", IdTickets);
    } else if (value === "ZALOPAY") {
      const fetchData = async () => {
        try {
          // Gọi API với appTransId trong URL
          const response = await axiosClient.post(
            `/tickets/order-status/${appTransId}`
          );

          const data = response.data;
          console.log(data);

          // Dùng switch để xử lý các trường hợp khác nhau
          switch (data.return_code) {
            case 1:
              setStatusTitle("Thanh toán thành công");
              setDescribe("Số tiền: " + formatCurrency(data.amount) + " VNĐ");
              setInvoiceCode(appTransId || "");
              setImageSource(require("../../assets/tick.gif"));
              setButtonText("Xem vé của bạn"); // Cập nhật text nút
              console.log("Updating ticket status for Id:", IdTickets);
              // Gửi yêu cầu cập nhật trạng thái vé PAID
              await axiosClient.put(`/tickets/update-status/${IdTickets}`, {
                status: "PAID",
              });
              break;

            case 3:
              setStatusTitle("Giao dịch đang được thực hiện");
              setDescribe("Vui lòng thực hiện thanh toán");
              setImageSource(require("../../assets/pending.gif"));
              console.log("Updating ticket status for Id:", IdTickets);
              setButtonText("Hủy vé"); // Cập nhật text nút
              // Gửi yêu cầu cập nhật trạng thái vé PAYMENTPENDING
              await axiosClient.put(`/tickets/update-status/${IdTickets}`, {
                status: "PAYMENTPENDING",
              });
              break;

            case 2:
              setStatusTitle("Thanh toán thất bại");
              setDescribe("Vé đã bị hủy. Vui lòng tạo lại vé");
              setImageSource(require("../../assets/x.gif"));
              console.log("Updating ticket status for Id:", IdTickets);
              // Gửi yêu cầu cập nhật trạng thái vé PAYMENT_FAILED
              await axiosClient.put(`/tickets/update-status/${IdTickets}`, {
                status: "CANCELED",
              });
              setButtonText("Tạo lại vé"); // Cập nhật text nút
              break;

            default:
              setStatusTitle(data.return_message);
              break;
          }
        } catch (error) {
          /* console.error("Error fetching payment status:", error); */
        }
      };

      // Lập lại yêu cầu API mỗi 20 giây
      interval = setInterval(fetchData, 3000);

      // Gọi ngay lần đầu tiên
      fetchData();

      // Cleanup khi component unmount hoặc khi không còn cần thiết
      return () => clearInterval(interval);
    }

    // Cleanup khi không phải là ZALOPAY
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [value, paymentStatus, appTransId, IdTickets]);

  const handleButtonPress = async () => {
    // Chuyển hướng tới màn hình "tickets" hoặc thực hiện các hành động khác
    switch (buttonText) {
      case "Xem vé của bạn":
        console.log("Redirecting to tickets screen...");
        // Thực hiện hành động chuyển đến màn hình vé (ví dụ: navigation.navigate('Tickets'))
        if (IdTickets) {
          navigation.navigate("TicketDetails", { ticketId: IdTickets });
          ticket.status = "success";
        } else {
          console.error("IdTickets is undefined.");
        }

      case "Tạo lại vé":
        console.log("Retrying payment...");
        onClose();
        break;

      case "Hủy vé":
        console.log("Cancelling transaction...");
        await axiosClient.put(`/tickets/update-status/${IdTickets}`, {
          status: "PAYMENTPENDING",
        });
        onClose();
        break;

      default:
        onClose(); // Đóng modal nếu không có hành động nào
        break;
    }
    await setTicketInfo(ticket);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {imageSource && <Image style={styles.image} source={imageSource} />}
          <Text style={styles.title}>{StatusTitle}</Text>
          <Text style={styles.content}>{Describe}</Text>
          {/* Chỉ hiển thị mã hóa đơn khi InvoiceCode có giá trị */}
          {InvoiceCode && (
            <Text style={styles.content}>Mã hóa đơn: {InvoiceCode}</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Nền mờ
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50", // Màu nền nút
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff", // Màu chữ nút
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 150,
    height: 150,
  },
});

export default Popup;
