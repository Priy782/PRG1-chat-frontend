<template>
    <div class="profile">
        <h1>Profil</h1>
        <div class="profile-container">
            <div class="form-group">
                <label>Aktueller Benutzername:</label>
                <p class="current-username">{{ currentUsername }}</p>
            </div>
            <form @submit.prevent="updateProfile">
                <div class="form-group">
                    <label for="username">Neuer Benutzername:</label>
                    <input
                        id="username"
                        v-model="username"
                        type="text"
                        placeholder="Neuer Benutzername"
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="password">Neues Passwort:</label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        placeholder="Neues Passwort"
                    />
                </div>
                <div class="form-actions">
                    <button type="submit">Änderungen speichern</button>
                    <button type="button" @click="backToChat">Zurück zum Chat</button>
                </div>
            </form>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success">{{ successMessage }}</p>
        </div>
    </div>
</template>

<script>
import axios from "axios";
//import { useExtractUserIdFromToken } from "@/helpers/helpers";

export default {
    data() {
        return {
            currentUsername: "", // Aktueller Benutzername
            username: "", // Neuer Benutzername
            password: "", // Neues Passwort
            userId: null, // Benutzer-ID aus dem Token
            errorMessage: "",
            successMessage: "",
        };
    },

    methods: {
        // Benutzer-ID aus dem Token extrahieren
        extractUserIdFromToken() {
            const token = localStorage.getItem('token');
            if (!token) {
                this.errorMessage = "Sie sind nicht eingeloggt.";
                this.$router.push("/login");
                return null;
            }

            try {
                // Token-Dekodierung
                const payload = JSON.parse(atob(token.split(".")[1]));

                return payload.userId; 
            } 
            catch (error) {
                console.error("Ungültiger Token:", error);
                this.errorMessage = "Ungültige Sitzungsdaten.";
                this.$router.push("/login");
                return null;
            }
        },

        // Profilinformationen abrufen
        async fetchProfile() {
            this.userId = this.extractUserIdFromToken();
            if (!this.userId) {
            console.log("no user id: " + this.userId);
            return;
            }

            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `https://chat.ndum.ch/api/users/${this.userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                // Benutzername laden
                this.currentUsername = response.data.username; // Aktueller Benutzername
                this.username = response.data.username; // Standardwert für neuen Benutzernamen

            } catch (error) {
                console.error("Fehler beim Laden des Profils:", error);
                this.errorMessage = "Profil konnte nicht geladen werden.";
            }
        },

        // Profil aktualisieren
        async updateProfile() {
            if (!this.userId) {
                this.errorMessage = "Benutzer-ID fehlt.";
                return;
            }

            try {
                const token = localStorage.getItem("token");

                // Benutzer aktualisieren
                await axios.put(
                    `https://chat.ndum.ch/api/users/${this.userId}`,
                    {
                        username: this.username,
                        password: this.password, // Nur senden, wenn eingegeben
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                this.successMessage = "Profil erfolgreich aktualisiert!";
                this.errorMessage = "";
                this.password = ""; 
                this.currentUsername = this.username; // Aktualisiere angezeigten Benutzernamen
            } catch (error) {
                console.error("Fehler beim Aktualisieren des Profils:", error);
                this.successMessage = "";
                this.errorMessage = "Profil konnte nicht aktualisiert werden.";
            }
        },

        backToChat() {
            this.$router.push("/chat");
        },
    },
    mounted() {
        this.fetchProfile(); // Profilinformationen laden
    },
};
</script>

<style>

</style>
