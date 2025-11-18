const conversations = {};
const API_BASE = "https://llm-multi-chat-front-end.onrender.com";
console.log("Multi-AI Chat Dashboard loaded.");

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll("#sidebar li");
    const main = document.getElementById("main-panel");

    items.forEach((item) => {
        item.addEventListener("click", () => {
            const modelName = item.textContent.trim();

            items.forEach((i) => i.classList.remove("active"));
            item.classList.add("active");

            if (modelName === "FranWizard") {
                main.innerHTML = `
                    <div class="chat-header">
                        <h2>FranWizard</h2>
                    </div>
                    <p>
                        FranWizard isn't wired to a backend yet.<br>
                        For now, use <strong>GPT-5</strong> for general chat,
                        <strong>Quote Calculator</strong> for on-the-spot cleaning quotes,
                        or <strong>Custom Model 2</strong> for experiments.
                    </p>
                `;
                return;
            }

            main.innerHTML = `
                <div class="chat-header">
                    <h2>${modelName}</h2>
                </div>
                <div id="chat-window" class="chat-window"></div>
                <form id="chat-form" class="chat-form">
                    <input
                        id="chat-input"
                        type="text"
                        placeholder="Type your message..."
                        autocomplete="off"
                        required
                    />
                    <button type="submit">Send</button>
                </form>
            `;

            if (!conversations[modelName]) {
                conversations[modelName] = [
                    { role: "system", content: `You are ${modelName}, a helpful assistant.` },
                ];
            }

            const chatWindow = document.getElementById("chat-window");
            const chatForm = document.getElementById("chat-form");
            const chatInput = document.getElementById("chat-input");

            renderConversation(chatWindow, conversations[modelName]);

            chatForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const text = chatInput.value.trim();
                if (!text) return;

                const convo = conversations[modelName];

                convo.push({ role: "user", content: text });
                renderConversation(chatWindow, convo);
                chatInput.value = "";
                chatInput.focus();

                try {
                    const endpoint =
                        modelName === "Quote Calculator"
                            ? `${API_BASE}/api/chat/quote`
                            : `${API_BASE}/api/chat/gpt5`;

                    const response = await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ messages: convo }),
                    });

                    const data = await response.json();

                    if (data.reply) {
                        convo.push(data.reply);
                    } else if (data.error) {
                        convo.push({
                            role: "assistant",
                            content: `Error: ${data.error}`,
                        });
                    } else {
                        convo.push({
                            role: "assistant",
                            content: "No reply received from server.",
                        });
                    }

                    renderConversation(chatWindow, convo);
                } catch (err) {
                    console.error(err);
                    convo.push({
                        role: "assistant",
                        content: "Error: Could not reach backend.",
                    });
                    renderConversation(chatWindow, convo);
                }
            });
        });
    });
});

function renderConversation(container, messages) {
    container.innerHTML = "";
    messages
        .filter((m) => m.role !== "system")
        .forEach((m) => {
            const div = document.createElement("div");
            div.classList.add(
                "chat-message",
                m.role === "user" ? "user" : "assistant"
            );
            div.textContent = m.content;
            container.appendChild(div);
        });

    container.scrollTop = container.scrollHeight;
}
