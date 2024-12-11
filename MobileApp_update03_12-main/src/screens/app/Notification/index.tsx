import { Image, SafeAreaView, Text, View } from "react-native";
import { styles } from "./style";
import { FlashList } from "@shopify/flash-list";
import Header from "../../../components/headerApp";
import { getAllTickets, Ticket } from "../../../utils/AsyncStorage";
import { useEffect, useState } from "react";

interface Notification {
  date: string;
  status: string;
  route: string;
  time: string;
  seats: string;
  success: boolean;
}

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationContainer}>
      <Text style={styles.date}>{item.date}</Text>
      <View
        style={[
          styles.notificationBox,
          item.success ? styles.successBox : styles.failedBox,
        ]}
      >
        <Image
          source={
            item.success
              ? require("../../../assets/pass.png")
              : require("../../../assets/false.png")
          }
          style={styles.icon}
        />
        <View style={styles.infoContainer}>
          <Text style={item.success ? styles.successText : styles.failedText}>
            {item.status}
          </Text>
          <Text style={styles.route}>Tuyến: {item.route}</Text>
          <Text style={styles.time}>Thời gian: {item.time}</Text>
          <Text style={styles.seats}>Ghế: {item.seats}</Text>
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      const storedTickets = await getAllTickets();
      console.log("Stored Tickets:", storedTickets);

      // Map tickets to notifications
      const tickets: Notification[] =
        storedTickets?.map((ticket: Ticket) => {
          const { status, route, departureTime, seat } = ticket;

          return {
            date: new Date(departureTime).toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }), // Format as "Thứ 7, 11/04/2024"
            status:
              status === "success" ? "Đặt vé thành công" : "Đặt vé thất bại",
            route: route || "Chưa xác định",
            time:
              new Date(departureTime).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }) +
              ", " +
              new Date(departureTime).toLocaleDateString("vi-VN"),
            seats: seat || "N/A",
            success: status === "success",
          };
        }) || [];

      setNotifications(tickets);
    };

    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Thông báo" />
      <FlashList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        estimatedItemSize={50}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;
