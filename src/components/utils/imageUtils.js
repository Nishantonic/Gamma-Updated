import html2canvas from "html2canvas"

export const convertToBase64 = async (component) => {
  const tempDiv = document.createElement("div")
  tempDiv.style.position = "absolute"
  tempDiv.style.left = "-9999px"
  document.body.appendChild(tempDiv)

  const ReactDOM = await import("react-dom")
  ReactDOM.render(component, tempDiv)

  const canvas = await html2canvas(tempDiv)
  const base64Image = canvas.toDataURL("image/png")

  ReactDOM.unmountComponentAtNode(tempDiv)
  document.body.removeChild(tempDiv)

  return base64Image
}

