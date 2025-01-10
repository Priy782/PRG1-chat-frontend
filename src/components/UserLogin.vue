<template>
    <div class="login">
        <img class="logoimage" src="../assets/logo.png" alt="berrylogo">
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
        <p style="text-align:left; font-size:10px;">Anleitung:
            <ol>
                <li>Registrieren</li>
                <li>Anmelden</li>
                <li>Loschatten</li>
            </ol>
        </p>
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

                // Speichere das JWT-Token im LocalStorage und den User im Session Storage
                const token = response.data.token;
                localStorage.setItem("token", token);
                sessionStorage.setItem("username", JSON.stringify(this.username));

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