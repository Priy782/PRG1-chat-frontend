import axios from 'axios';

// Benutzer-ID aus dem Token extrahieren
export function useExtractUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Sie sind nicht eingeloggt.");
        //$router.push("/login");
        return null;
    }

    try {
        // Token-Dekodierung
        const payload = JSON.parse(atob(token.split(".")[1]));

        return payload.userId; 
    } 
    catch (error) {
        console.error("Ungültiger Token:", error);
        alert("Ungültige Sitzungsdaten.");
        //this.$router.push("/login");
        return null;
    }
}
// Profilinformationen abrufen
export async function useFetchProfile() {
    const userId = useExtractUserIdFromToken();
    //let currentUsername = "";
   // let username = "";

    if (!userId) {
    console.log("no user id: " + this.userId);
    return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            `http://localhost:3000/api/users/${userId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        // Benutzername laden
        //currentUsername = response.data.username; // Aktueller Benutzername
       // username = response.data.username; // Standardwert für neuen Benutzernamen
        return response;

    } catch (error) {
        console.error("Fehler beim Laden des Profils:", error);
        //alert("Profil konnte nicht geladen werden.");
    }
}