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

export default {
    data() {
        return {
            users: [], // Liste aller Benutzer
            messages: [], // Liste aller Nachrichten
            newMessage: "", // Aktuelle Nachricht
        };
    },
    methods: {
        scrollToBottom() {
        const container = this.$refs.messagesContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },

        // Nachrichten laden
        async loadMessages() {
            try {
                const response = await axios.get("http://localhost:3000/api/messages");
                this.messages = response.data;
                console.log("Nachrichten:", response.data); // Daten in der Konsole anzeigen
                // Nach dem Laden der Nachrichten automatisch scrollen
                this.$nextTick(() => {
                        this.scrollToBottom();
                    });
            } catch (error) {
                console.error("Fehler beim Laden der Nachrichten:", error);
            }
        },


        async loadUsers() {
         try {
            // 1. Benutzerliste von der API abrufen
            const userResponse = await axios.get('http://localhost:3000/api/users');
            const users = userResponse.data;

            // 2. Nachrichten von der API abrufen
            const messageResponse = await axios.get('http://localhost:3000/api/messages');
            const messages = messageResponse.data;

            const now = Date.now();
            const userStatusMap = {};

            // 3. Benutzer mit Zeitstempeln aus Nachrichten füllen
            messages.forEach(message => {
                const { username, createdAt } = message;
                const messageTime = new Date(createdAt).getTime();

                // Speichere den neuesten Zeitstempel für jeden Benutzer
                if (!userStatusMap[username] || userStatusMap[username] < messageTime) {
                    userStatusMap[username] = messageTime;
                }
            });

            // 4. Alle Benutzer zusammenstellen, auch ohne Nachrichten
            this.users = users.map(user => {
                const lastActive = userStatusMap[user.username] || 0; // Falls keine Nachricht gesendet wurde, Zeitstempel = 0
                const status = now - lastActive < 60 * 60 * 1000 ? 'online' : 'offline'; // Online innerhalb der letzten Stunde
                return { username: user.username, lastActive, status };
            }); 
            } catch (error) {
                console.error('Fehler beim Laden der Benutzer oder Nachrichten:', error);
            }
        },

        // Nachricht senden
        async sendMessage() {
            if (this.newMessage.trim() === "") return;

            try {
                const response = await axios.post("http://localhost:3000/api/messages", {
                    message: this.newMessage,
                });
                this.messages.push(response.data); // Nachricht zur Liste hinzufügen
                this.newMessage = ""; // Eingabefeld leeren
                 // Nach dem Hinzufügen der Nachricht automatisch scrollen
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            } catch (error) {
                console.error("Fehler beim Senden der Nachricht:", error);
            }
        },

        // Timestamp formatieren
        formatTimestamp(timestamp) {
            return new Date(timestamp).toLocaleString();
        },

        goToProfile() {
            this.$router.push("/profile");
        },

        logout() {
            localStorage.removeItem("token");
            this.$router.push("/login");
        },

    },
    mounted() {
        // Daten laden
        this.loadMessages();
        this.loadUsers();
        // Automatisch nach unten scrollen, wenn die Komponente geladen wird
        this.$nextTick(() => {
            this.scrollToBottom();
        });

        // Polling für neue Daten alle 10 Sekunden
        setInterval(() => {
            this.loadMessages();
            this.loadUsers();
        }, 10000);
    },
};
</script>

<style>
/* Keine Verwendung von scoped hier */
</style>
