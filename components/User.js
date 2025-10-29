import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { UserType } from "../UserContext";
import { BASE_URL } from "../config";

const User = ({ item }) => {
  const { userId } = useContext(UserType);
  const [requestSent, setRequestSent] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [userFriends, setUserFriends] = useState([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        console.log(
          `🌍 Fetching Sent Friend Requests: ${BASE_URL}/friend-request/sent/${userId}`
        );

        const response = await fetch(
          `${BASE_URL}/friend-request/sent/${userId}`
        );
        const data = await response.json();
        setFriendRequests(data);
      } catch (error) {
        console.log("❌ Fetch Friend Requests Error:", error.message);
      }
    };

    if (userId) fetchFriendRequests();
  }, [userId]);

  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        console.log(`🌍 Fetching Friends: ${BASE_URL}/friends/${userId}`);

        const response = await fetch(`${BASE_URL}/friends/${userId}`);
        const data = await response.json();
        setUserFriends(data);
      } catch (error) {
        console.log("❌ Fetch User Friends Error:", error.message);
      }
    };

    if (userId) fetchUserFriends();
  }, [userId]);

  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    try {
      console.log(`📨 Sending Friend Request: ${BASE_URL}/friend-request`);
      const response = await fetch(`${BASE_URL}/friend-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentUserId, selectedUserId }),
      });

      if (response.ok) {
        console.log("✅ Friend request sent!");
        setRequestSent(true);
      }
    } catch (error) {
      console.log("❌ Error sending friend request:", error.message);
    }
  };

  return (
    <Pressable
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}
    >
      <Image
        style={{ width: 50, height: 50, borderRadius: 25 }}
        source={{ uri: item.image }}
      />

      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "bold" }}>{item?.name}</Text>
        <Text style={{ marginTop: 4, color: "gray" }}>{item?.email}</Text>
      </View>

      {userFriends.includes(item._id) ? (
        <Pressable style={styles.friendsBtn}>
          <Text style={styles.btnText}>Friends</Text>
        </Pressable>
      ) : requestSent || friendRequests.some((req) => req._id === item._id) ? (
        <Pressable style={styles.sentBtn}>
          <Text style={styles.btnText}>Request Sent</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => sendFriendRequest(userId, item._id)}
          style={styles.addBtn}
        >
          <Text style={styles.btnText}>Add Friend</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

export default User;

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: "#567189",
    padding: 10,
    borderRadius: 6,
    width: 105,
  },
  sentBtn: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 6,
    width: 105,
  },
  friendsBtn: {
    backgroundColor: "#82CD47",
    padding: 10,
    width: 105,
    borderRadius: 6,
  },
  btnText: {
    textAlign: "center",
    color: "white",
    fontSize: 13,
  },
});
