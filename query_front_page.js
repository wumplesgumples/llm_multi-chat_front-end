const conversations = {};
console.log("Multi-AI Chat Dashboard loaded.")

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
        });
    });
});

function renderConversation(container, messages) {
    container.innerHTML = "";
    messages
        .filter(m => m.role !== "system")
        .forEach(m => {
        const div = document.createElement("div");
        div.classList.add("chat-message", m.role === "user" ? "user" : "assistant");
        div.textContent = m.content;
        container.appendChild(div);
        });

    container.scrollTop = container.scrollHeight;
}