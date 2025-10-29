import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../config"; // ✅ Use the same BASE_URL everywhere

const FriendRequest = ({ item, friendRequests, setFriendRequests }) => {
  const { userId } = useContext(UserType);
  const navigation = useNavigation();

  const acceptRequest = async (senderId) => {
    try {
      console.log(
        `✅ Accepting friend request: ${BASE_URL}/friend-request/accept`
      );

      const response = await fetch(`${BASE_URL}/friend-request/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId,
          recepientId: userId,
        }),
      });

      const data = await response.json();
      console.log("✅ Response:", data);

      setFriendRequests(friendRequests.filter((req) => req._id !== senderId));
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
