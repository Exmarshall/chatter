import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();

  // ✅ Automatically switch API URL
  const API_BASE_URL =
    Platform.OS === "android" || Platform.OS === "ios"
      ? "https://chatter-70mf1zyq1-hayatudeens-projects.vercel.app"
      : "http://localhost:8000";

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return Alert.alert("Error", "All fields are required");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        name,
        email,
        password,
        image,
      });

      Alert.alert(
        "Success",
        response.data.message || "Registered successfully ✅"
      );

      setName("");
      setEmail("");
      setPassword("");
      setImage("");

      // Navigate to Login
      navigation.replace("Login");
    } catch (error) {
      console.log(
        "❌ Registration Error:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "An error occurred"
      );
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <View style={styles.header}>
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>Create a new account</Text>
        </View>

        <View style={{ marginTop: 50 }}>
          {/* Name */}
          <View>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor={"black"}
              placeholder="Enter your name"
            />
          </View>

          {/* Email */}
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor={"black"}
              placeholder="Enter your email"
            />
          </View>

          {/* Password with eye icon */}
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                placeholderTextColor={"black"}
                placeholder="Enter password"
              />
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="gray"
                onPress={() => setShowPassword(!showPassword)}
              />
            </View>
            <View style={styles.underline} />
          </View>

          {/* Image */}
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Image (optional)</Text>
            <TextInput
              value={image}
              onChangeText={setImage}
              style={styles.input}
              placeholderTextColor={"black"}
              placeholder="Paste image URL"
            />
          </View>

          {/* Register Button */}
          <Pressable onPress={handleRegister} style={styles.registerButton}>
            <Text style={styles.registerText}>Register</Text>
          </Pressable>

          {/* Go Back */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.loginLink}>
              Already have an account? Sign in
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
  },
  header: {
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#4A55A2",
    fontSize: 17,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "gray",
  },
  input: {
    fontSize: 18,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    marginVertical: 10,
    width: 300,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 300,
    justifyContent: "space-between",
  },
  underline: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    width: 300,
    alignSelf: "center",
  },
  registerButton: {
    width: 200,
    backgroundColor: "#4A55A2",
    padding: 15,
    marginTop: 50,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 6,
  },
  registerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginLink: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
});
