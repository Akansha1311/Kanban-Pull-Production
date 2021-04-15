const extraFieldButton = document.getElementById("customFields");
let extraField__div = document.getElementById("extra-fields-div");

extraFieldButton.addEventListener("click", function (e) {
  e.preventDefault();
  let input = document.createElement("input");
  input.setAttribute("type", "text");
  let fieldLabel = prompt("Field Type: (example: supplier)");
  input.setAttribute("name", fieldLabel);
  let label = document.createElement("lable");
  label.setAttribute("for", fieldLabel);
  label.innerText = fieldLabel + " :";
  extraField__div.appendChild(label);
  extraField__div.appendChild(input);
});
