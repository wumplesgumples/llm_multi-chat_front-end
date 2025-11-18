const conversations = {};
console.log("Multi-AI Chat Dashboard loaded.");

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll("#sidebar li");
    const main = document.getElementById("main-panel");

    items.forEach(item => {
        item.addEventListener("click", () => {
            const modelName = item.textContent.trim();

            items.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

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
                    { role: "system", content: `You are ${modelName}, a helpful assistant.` }
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
                    const response = await fetch("http://localhost:3000/api/chat/gpt5", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ messages: convo })
                    });

                    const data = await response.json();

                    if (data.reply) {
                        convo.push(data.reply);
                        renderConversation(chatWindow, convo);
                    } else if (data.error) {
                        convo.push({
                            role: "assistant",
                            content: `Error: ${data.error}`
                        });
                        renderConversation(chatWindow, convo);
                    }
                } catch (err) {
                    console.error(err);
                    convo.push({
                        role: "assistant",
                        content: "Error: Could not reach backend."
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
        .filter(m => m.role !== "system")
        .forEach(m => {
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
