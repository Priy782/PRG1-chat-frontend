<template>
    <div class="login">
        <h1>Login</h1>
        <form @submit.prevent="handleLogin">
            <input v-model="username" type="text" placeholder="Benutzername" />
            <input v-model="password" type="password" placeholder="Passwort" />
            <div class="button-container">
                <button type="submit">Anmelden</button>
                <button type="button" @click="goToRegister">Registrieren</button>
            </div>
        </form>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "UserLogin",
    data() {
        return {
            username: "",
            password: "",
            errorMessage: "",
        };
    },
    methods: {
        async handleLogin() {
            try {
                const response = await axios.post("https://chat.ndum.ch/api/auth/login", {
                    username: this.username,
                    password: this.password,
                });

                // Speichere das JWT-Token im LocalStorage
                const token = response.data.token;
                localStorage.setItem("token", token);

                // Weiterleitung zur Chat-Seite
                this.$router.push("/chat");
            } catch (error) {
                this.errorMessage = "Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.";
            }
        },
        goToRegister() {
            this.$router.push("/register"); // Navigiert zur Registrierungsseite
        },
    },
};
</script>

<style>
/* Keine Verwendung von scoped hier */
</style>