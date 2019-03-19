export default {
    render(template, model, { tag, id, display, top = 0, left = 0 }) {

        let container = document.createElement(tag);

        container.innerHTML = template(model);
        container.id = id;
        
        if (arguments.length > 2) {
            if (document.getElementById(id)) {
                document.getElementById(id).remove();
            }
            document.body.appendChild(container);
            let containerChild = document.getElementById(id).firstElementChild;

            containerChild.style.left = `${left}px`;
            containerChild.style.top = `${top}px`;
            containerChild.style.display = display;
        }
    }

}