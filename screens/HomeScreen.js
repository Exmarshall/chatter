import { StyleSheet, Text, View } from "react-native";
import React, { useLayoutEffect, useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import User from "../components/User";
import { BASE_URL } from "../config";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Ping Me</Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons
            onPress={() => navigation.navigate("Chats")}
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
          />
          <MaterialIcons
            onPress={() => navigation.navigate("Friends")}
            name="people-outline"
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        console.log("🔑 Token:", token);

        if (!token) return;

        const decodedToken = jwtDecode(token); // ✅ Correct usage
        console.log("🔍 Decoded Token:", decodedToken);

        const loggedInUserId = decodedToken.userId;
        setUserId(loggedInUserId);

        console.log(
          `🌍 Fetching users from: ${BASE_URL}/users/${loggedInUserId}`
        );

        const response = await axios.get(`${BASE_URL}/users/${loggedInUserId}`);
        console.log("✅ Users Fetched:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.log(
          "❌ Error retrieving users:",
          error.response?.data || error.message
        );
      }
    };

    fetchUsers();
  }, []);

  return (
    <View>
      <View style={{ padding: 10 }}>
        {users.map((item, index) => (
          <User key={index} item={item} />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
