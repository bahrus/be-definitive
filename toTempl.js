export function toTempl(templ, fromShadow) {
    let templateToClone = templ;
    if (!(templateToClone instanceof HTMLTemplateElement)) {
        templateToClone = document.createElement('template');
        if (fromShadow) {
            templateToClone.innerHTML = templ.shadowRoot.innerHTML;
        }
        else {
            templateToClone.innerHTML = templ.innerHTML;
        }
    }
    // insertMoustache('x-f', templateToClone);
    // insertMoustache('data-xf', templateToClone);
    return templateToClone;
}
// function insertMoustache(bindAttr: string, templateToClone: HTMLTemplateElement){
//     const targets = templateToClone.content.querySelectorAll(`[${bindAttr}]`);
//     for(const target of targets){
//         target.innerHTML = `{{${target.getAttribute(bindAttr)}}}`;
//         target.removeAttribute(bindAttr);
//     }
// }
