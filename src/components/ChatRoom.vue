<template>
    <div class="chat-room">
        <!-- Header -->
        <header class="chat-header">
            <img class="logoimage" src="../assets/logo.png" alt="berrylogo">
            <h1>Bluey's Berry Chat</h1>
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
                        <span :class="['status-dot', user.status ]"></span>
                    </li>
                </ul>
                <p style="font-size:10px;">*Reload the browser page to update the user status (online/offline)</p>
            </div>

            <!-- Rechte Spalte -->
            <div class="chat-content">
                <!-- Nachrichtenbereich -->
                <!-- <div class="chat-messages" ref="messagesContainer">
                    <div v-for="message in messages" :key="message._id" class="message">
                        <div class="message-bubble">
                            <strong class="message-username">{{ message.username }}</strong>
                            <p class="message-text">{{ message.message }}</p>
                            <span class="timestamp">{{ formatTimestamp(message.createdAt) }}</span>
                        </div>
                    </div>
                </div> -->
                <!-- Messages dynamisch an Hand vom Ersteller klassifizieren -->
                <div class="chat-messages" ref="messagesContainer">
                    <div v-for="message in messages" :key="message._id" class="message">
                        <div class="message-bubble" :class="{ 'own-message-bubble': message.username === username }">
                            <strong class="message-username">{{ message.username }}</strong>
                            <p class="message-text">{{ message.message }}</p>
                            <span class="timestamp">{{ formatTimestamp(message.createdAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Eingabefeld -->
                <form class="message-form" @submit.prevent="sendMessage">
                    <input
                        v-model="newMessage"
                        type="text"
                        placeholder="Nachricht eingeben..."
                    />
                    <button type="submit"><img src="../assets/sendbutton.png" /></button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
const token = localStorage.getItem('token');

export default {
    data() {
        return {
            users: [], // Liste aller Benutzer
            messages: [], // Liste aller Nachrichten
            newMessage: "", // Aktuelle Nachricht
            socket: null, // WebSocket-Objekt
            userProfile: null, //Userprofil-Objekt
            currentUserId: "",
            username: JSON.parse(sessionStorage.getItem('username')),
        };
    },
    
    methods: {

        setupWebSocket() {
            this.socket = new WebSocket('wss://chat.ndum.ch/api');
            //this.socket.binaryType = 'blob'

            this.socket.onopen = () => {
                console.log("WebSocket verbunden.");
                console.log("WebSocket-Status:", this.socket.readyState);
            };
            this.socket.onerror = (error) => {
                console.error("WebSocket-Fehler:", error);
                console.log("WebSocket-Status:", this.socket.readyState);
            };

            this.socket.onmessage = (event) => {            
                try {                
                    const message = JSON.parse(event.data);                
                if (message.type === "new_message") {                
                    this.messages.push(message.data);                
                    this.$nextTick(() => this.scrollToBottom());                
                }
                if (message.type === "new_login") {
                    this.users.push(message.data);

                }
                this.loadUsers();
                this.loadMessages();          
            } 
            catch (error) {  
                          console.error("Fehler beim Parsen der Nachricht:", error);         
                          }
            };
            this.socket.onclose = () => {
                console.log("WebSocket connection closed.");
            };

        },
        async sendMessage() {
            if (this.newMessage.trim() === "") return;
            try {
                const { response } = await axios.post('https://chat.ndum.ch/api/messages', {
                    username: this.currentUserId,
                    message: this.newMessage,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}` 
                    }
                })
                if (!response) {
                    console.log("Fehler beim Senden der Nachricht");
                }
                
                this.newMessage = ""; // Eingabefeld leeren

                 // Nach dem Hinzufügen der Nachricht automatisch scrollen
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            } catch (error) {
                console.error("Fehler beim Senden der Nachricht:", error);
            }
        },
      
        scrollToBottom() {
            const container = this.$refs.messagesContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },

        //initiales Laden der Nachrichten
        async loadMessages() {
            try {
                const response = await axios.get('https://chat.ndum.ch/api/messages',
                {
                    headers: { Authorization: `Bearer ${token}` } 
                })
                this.messages = response.data;
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            } catch (error) {
                console.error("Fehler beim Laden der Nachrichten:", error);
            }
        },

        //lade die vorhandenen User, und setze den Status an Hand der letzten Aktivität 
        // (letzte Nachricht gesendet grösser als 10 minuten = offline)
        async loadUsers() {
            try {
                const userResponse = await axios.get("https://chat.ndum.ch/api/users");
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
                        now - lastActive > 10 * 60 * 1000 ? "offline" : "online";
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
