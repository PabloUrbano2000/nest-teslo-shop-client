import { Manager, Socket } from "socket.io-client";

let socket: Socket;
export const connectToServer = (token: string) => {
    const manager = new Manager(
        "http://localhost:3000/socket.io/socket.io.js",
        {
            extraHeaders: {
                authentication: token,
            },
        }
    );

    // si existe socket elimina todos los anteriores
    socket?.removeAllListeners();

    // conectandose al nuevo socket (namespace)
    socket = manager.socket("/");

    addListeners();
};

const addListeners = () => {
    // TODO: #clients-ul

    const serverStatusLabel = document.querySelector("#server-status");
    const clientsUl = document.querySelector("#clients-ul");
    const messageForm =
        document.querySelector<HTMLFormElement>("#message-form");
    const messageInput =
        document.querySelector<HTMLInputElement>("#message-input");

    const messagesUl = document.querySelector("#messages-ul");

    socket.on("connect", () => {
        if (serverStatusLabel) {
            serverStatusLabel.innerHTML = "connected";
        }
    });

    socket.on("disconnect", () => {
        if (serverStatusLabel) {
            serverStatusLabel.innerHTML = "disconnect";
        }
    });

    socket.on("clients-updated", (clients: string[]) => {
        let clientsHtml = "";
        clients.forEach((clientId) => {
            clientsHtml += `
                <li>${clientId}</li>
            `;
        });
        if (clientsUl) {
            clientsUl.innerHTML = clientsHtml;
        }
    });

    messageForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (messageInput) {
            if (messageInput?.value?.trim()?.length <= 0) return;

            socket.emit("message-from-client", {
                id: "YO!!!",
                message: messageInput.value,
            });

            messageInput.value = "";
        }
    });

    socket.on(
        "messages-from-server",
        (payload: { fullName: string; message: string }) => {
            const newMessage = `
                <li>
                    <strong>${payload.fullName}</strong>
                    <span>${payload.message}</span>
                </li>
            `;
            const li = document.createElement("li");
            li.innerHTML = newMessage;
            messagesUl?.append(li);
        }
    );
};
