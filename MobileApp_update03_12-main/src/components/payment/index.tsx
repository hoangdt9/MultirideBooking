import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Linking } from "react-native";
import { updatePaymentMethod } from "../../screens/CreateticketsScreen/showticket";
import { styles } from "./styles";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import { payment } from "../../../src/data/data";
import Popup from "../diglogPay/dialogPay"; // Import Popup component
interface PaymentComponentProps {
  dataTickes: any; // ID của vé
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({ dataTickes }) => {
  const [value, setValue] = useState<string>(""); // Đảm bảo giá trị mặc định không phải là null
  const [timeLeft, setTimeLeft] = useState(600); // Đếm ngược từ 600 giây (10 phút) 10 phút = 600
  const [showDialog, setShowDialog] = useState(false); // Trạng thái hiển thị dialog
  const [paymentStatus, setPaymentStatus] = useState<string>(""); // Trạng thái thanh toán
  const [appTransId, setAppTransId] = useState<string>(""); // Trạng thái thanh toán
  const [paymentMethod, setpaymentMethod] = useState<string>(""); // Trạng thái thanh toán
  const [IdTickets, setIdTickets] = useState<string>(""); // Trạng thái thanh toán

  // Lọc icon theo giá trị đã chọn
  const selectedPayment = payment.find((item) => item.value === value);
  const selectedIcon = selectedPayment ? selectedPayment.icon : null;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Tạo hiệu ứng để cập nhật đếm ngược mỗi giây
  useEffect(() => {
    if (timeLeft === 0) return; // Dừng khi thời gian còn lại là 0

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1); // Giảm thời gian mỗi giây
    }, 1000);

    // Dọn dẹp timer khi component unmount hoặc khi timeLeft giảm về 0
    return () => clearInterval(timerId);
  }, [timeLeft]);
  /* console.log("giá trị component get được", dataTickes); */
  const token = "your-auth-token";
  /* Xử lý giao diện */
  const renderItem = (item: { label: string; value: string; icon: any }) => {
    return (
      <View style={styles.item}>
        <Image source={item.icon} style={styles.iconImage} />
        <Text style={styles.textItem}>{item.label}</Text>
        {item.value === value && (
          <AntDesign
            style={styles.icon}
            color="#9ABF80"
            name="check"
            size={24}
          />
        )}
      </View>
    );
  };

  /* Khi bấm thanh toán */
  const handlePaymentUpdate = async () => {
    try {
      const id = dataTickes._id;
      console.log(value); // Phương thức thanh toán đã chọn
      console.log(id); // ID của vé
      console.log(token); // Token xác thực
      // Gửi phương thức thanh toán lên API và lưu kết quả vào 'result'

      // Kiểm tra nếu người dùng chưa chọn phương thức thanh toán hợp lệ
      if (value !== "ZALOPAY" && value !== "OFFLINEPAYMENT") {
        alert("Vui lòng chọn phương thức thanh toán !");
        return; // Dừng hàm nếu không hợp lệ
      }
      const result = await updatePaymentMethod(id, value, token);
      console.log("Payment method updated successfully:", result);
      console.log("dataTickes", dataTickes);

      // Kiểm tra nếu phương thức thanh toán là ZALOPAY, lấy URL thanh toán
      if (value === "ZALOPAY" && result && result.order_url) {
        // Mở URL thanh toán ZaloPay trong trình duyệt di động
        Linking.openURL(result.order_url).catch((err) => {
          console.error("Failed to open URL:", err);
        });
        setValue("ZALOPAY");
        setAppTransId(result.appTransId);
        setShowDialog(true);
        setIdTickets(id);
      }

      // Nếu phương thức thanh toán là OFFLINEPAYMENT, kiểm tra trạng thái thanh toán
      if (
        result.ticketInfo.paymentMethod === "OFFLINEPAYMENT" &&
        result &&
        result.ticketInfo.status === "PAYMENTPENDING"
      ) {
        setValue(result.ticketInfo.paymentMethod);
        setPaymentStatus(result.ticketInfo.status);
        setIdTickets(id);
        setShowDialog(true); // Giả sử bạn đã có một state để hiển thị dialog
      }

      // Bạn có thể làm gì đó sau khi thành công, ví dụ điều hướng người dùng hoặc thông báo
    } catch (error) {
      /* console.error("Failed to update payment method:", error); */
    }
  };

  return (
    <View style={styles.viewtwo}>
      {/* Thời gian giữ vé */}
      <View style={styles.containerTime}>
        <View style={styles.sectionTime}>
          <Text style={styles.lableTime}>Thời gian giữ vé còn lại </Text>
          <Text style={styles.countdownText}>
            {minutes < 10 ? `0${minutes}` : minutes}:
            {seconds < 10 ? `0${seconds}` : seconds}
          </Text>
        </View>
      </View>

      {/* Phương thức thanh toán */}
      <View style={styles.sectionPay}>
        <Text style={styles.sectionTitlePay}>Phương thức thanh toán:</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={payment}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Chọn phương thức thanh toán"
          value={value}
          onChange={(item) => {
            setValue(item.value);
            console.log("Người dùng đã chọn:", item);
          }}
          renderLeftIcon={() =>
            selectedIcon ? (
              <Image style={styles.selectedIcon} source={selectedIcon} />
            ) : null
          }
          renderItem={renderItem}
        />
      </View>

      {/* Nút Thanh toán */}
      {/* <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handlePaymentUpdate}
        >
          <Text style={styles.buttonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handlePaymentUpdate}
        >
          <Text style={styles.buttonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>

      {/* Hiển thị Popup */}
      <Popup
        isVisible={showDialog}
        onClose={() => setShowDialog(false)}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        paymentStatus={paymentStatus}
        value={value}
        appTransId={appTransId}
        IdTickets={IdTickets}
        dataTickes={dataTickes}
      />
    </View>
  );
};

export default PaymentComponent;
