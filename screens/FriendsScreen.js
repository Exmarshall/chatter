import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../config";

const FriendRequest = ({ item, friendRequests, setFriendRequests }) => {
  const { userId } = useContext(UserType);
  const navigation = useNavigation();

  const acceptRequest = async (senderId) => {
    try {
      console.log("✅ Accepting friend request from:", senderId);

      const response = await fetch(`${BASE_URL}/friend-request/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: senderId, // The person who SENT request
          recepientId: userId, // The person ACCEPTING request
        }),
      });

      const data = await response.json();
      console.log("📦 Server Response:", data);

      if (!response.ok) {
        console.log("❌ Failed to accept request");
        return;
      }

      // Remove accepted request from UI immediately
      setFriendRequests(friendRequests.filter((req) => req._id !== senderId));

      console.log("🎉 Friend request accepted!");
      navigation.navigate("Chats");
    } catch (err) {
      console.log("❌ Error accepting friend request:", err.message);
    }
  };

  return (
    <Pressable style={styles.container}>
      <Image style={styles.avatar} source={{ uri: item.image }} />
      <Text style={styles.text}>{item?.name} sent you a friend request!</Text>

      <Pressable style={styles.button} onPress={() => acceptRequest(item._id)}>
        <Text style={styles.buttonText}>Accept</Text>
      </Pressable>
    </Pressable>
  );
};

export default FriendRequest;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  text: { fontSize: 15, fontWeight: "bold", marginLeft: 10, flex: 1 },
  button: { backgroundColor: "#0066b2", padding: 10, borderRadius: 6 },
  buttonText: { color: "white", textAlign: "center" },
});
