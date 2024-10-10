export function EncDctFn(params, type) {
  try {
    if (params && type === "encrypt") {
      const encodedString = window.btoa(params);
      return encodedString;
    }
    if (params && type === "decrypt") {
      const decodedString = window.atob(params);
      return decodedString;
    }
  } catch (error) {
    console.log("error =======>>>", error);
    return "";
  }
}
