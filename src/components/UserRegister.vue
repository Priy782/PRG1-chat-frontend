<template>
    <div class="register">
        <h2>Registrieren</h2>
        <form @submit.prevent="register">
            <input v-model="username" type="text" placeholder="Benutzername" required />
            <input v-model="password" type="password" placeholder="Passwort" required />
            <button type="submit">Registrieren</button>
        </form>
        <div class="additional-actions">
            <button @click="goToLogin">Zur&uuml;ck zur Anmeldung</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            username: '',
            password: '',
        };
    },
    methods: {
        async register() {
            try {
                const response = await axios.post('https://chat.ndum.ch/api/auth/register', {
                    username: this.username,
                    password: this.password,
                });
                if (response.status === 201) {
                    alert("Registrierung erfolgreich!");
                    this.$router.push("/login"); // Weiterleitung zur Login-Seite
                }
            } catch (error) {
                console.error('Fehler bei der Registrierung:', error);
                alert('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
            }
        },
        goToLogin() {
            this.$router.push('/login'); // Navigiert zurück zur Anmeldeseite
        },
    },
};
</script>

<style>

</style>
