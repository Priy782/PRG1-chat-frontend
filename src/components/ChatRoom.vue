<template>
    <div class="chat-room">
        <!-- Header -->
        <header class="chat-header">
            <h1>Blueberry Chat</h1>
            <div class="header-buttons">
                <button @click="goToProfile">Profil</button>
                <button @click="logout">Logout</button>
            </div>
        </header>

        <!-- Chat-Inhalt -->
        <div class="chat-content-wrapper">
            <!-- Linke Spalte -->
            <div class="chat-container">
                <h2>Benutzer</h2>
                <ul class="user-list">
                    <li v-for="user in users" :key="user.username" :class="user.status">
                        <span>{{ user.username }}</span>
                        <span :class="['status-dot', user.status]"></span>
                    </li>
                </ul>
            </div>

            <!-- Rechte Spalte -->
            <div class="chat-content">
                <!-- Nachrichtenbereich -->
                <div class="chat-messages" ref="messagesContainer">
                    <div v-for="message in messages" :key="message._id" class="message">
                        <strong>{{ message.username }}</strong>: {{ message.message }}
                        <span class="timestamp">{{ formatTimestamp(message.createdAt) }}</span>
                    </div>
                </div>

                <!-- Eingabefeld -->
                <form class="message-form" @submit.prevent="sendMessage">
                    <input
                        v-model="newMessage"
                        type="text"
                        placeholder="Nachricht eingeben..."
                    />
                    <button type="submit">Senden</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
//import { useExtractUserIdFromToken } from "@/helpers/helpers";
import { useFetchProfile } from "@/helpers/helpers";

export default {
    data() {
        return {
            users: [], // Liste aller Benutzer
            messages: [], // Liste aller Nachrichten
            newMessage: "", // Aktuelle Nachricht
            socket: null, // WebSocket-Objekt
            userProfile: null, //Userprofil-Objekt
            currentUserId: "",
        };
    },
    
    methods: {
        setupWebSocket() {
            this.socket = new WebSocket('ws://localhost:3000');
            //this.socket.binaryType = 'blob'

            // Verbindung herstellen
            this.socket.onopen = () => {
                console.log("WebSocket verbunden.");
                console.log("WebSocket-Status:", this.socket.readyState);
            };
            this.socket.onerror = (error) => {
                console.error("WebSocket-Fehler:", error);
                console.log("WebSocket-Status:", this.socket);
            };

            this.socket.onmessage = (event) => {
                console.log("Message from server ", event.data);
                this.messages.push(event.data);
                this.$nextTick(() => this.scrollToBottom());
            };
        },
        async sendMessage() {
            this.userProfile = await useFetchProfile();
            //console.log(this.userProfile.data);
            this.currentUserId = this.userProfile.data.username;

            if (this.currentUserId) {
                try {
                   // Erstellen des neuen Nachrichtenobjekts
                    const message = {
                        type: "new_message",
                        data: {
                            _id: "",
                            username: this.currentUserId,
                            message: this.newMessage,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            __v: 0 
                        }
                    };

                    // Nachricht über den WebSocket senden JSON.stringify(message)
                    this.socket.send(message);
                    console.log('Nachricht gesendet:', message);

                    // Eingabefeld leeren
                    this.newMessage = "";
                } catch (error) {
                    console.error("Fehler beim Dekodieren des Tokens:", error);
                }
            } else {
                console.error("Kein Token gefunden. Benutzer ist nicht authentifiziert.");
            }
        },      
        scrollToBottom() {
            const container = this.$refs.messagesContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },

        //Nachrichten laden
        async loadMessages() {
            try {
                const response = await axios.get("http://localhost:3000/api/messages");
                this.messages = response.data;
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            } catch (error) {
                console.error("Fehler beim Laden der Nachrichten:", error);
            }
        },

        async loadUsers() {
            try {
                const userResponse = await axios.get("http://localhost:3000/api/users");
                const users = userResponse.data;

                const now = Date.now();
                const userStatusMap = {};

                this.messages.forEach((message) => {
                    const { username, createdAt } = message;
                    const messageTime = new Date(createdAt).getTime();

                    if (!userStatusMap[username] || userStatusMap[username] < messageTime) {
                        userStatusMap[username] = messageTime;
                    }
                });

                this.users = users.map((user) => {
                    const lastActive = userStatusMap[user.username] || 0;
                    const status =
                        now - lastActive < 60 * 60 * 1000 ? "online" : "offline";
                    return { username: user.username, lastActive, status };
                });
            } catch (error) {
                console.error("Fehler beim Laden der Benutzer:", error);
            }
        },

        formatTimestamp(timestamp) {
            return new Date(timestamp).toLocaleString();
        },

        goToProfile() {
            this.$router.push("/profile");
        },

        logout() {
            localStorage.removeItem("token");
            this.socket.close();
            this.$router.push("/login");
        },
    },
    mounted() {
        this.setupWebSocket();
        this.loadMessages();
        this.loadUsers();

    },
    beforeUnmount() {
        if (this.socket) {
            this.socket.close(); 
        }
    },
};
</script>

<style>
/* Bestehende Styles */
</style>
