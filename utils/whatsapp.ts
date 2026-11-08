export function linkWhatsApp(telefone: string | undefined, mensagem: string) {
  const digitos = (telefone || "").replace(/\D/g, "");
  const numero = digitos.length >= 10 && digitos.length <= 11 ? `55${digitos}` : digitos;
  const texto = encodeURIComponent(mensagem);
  return numero ? `https://wa.me/${numero}?text=${texto}` : `https://wa.me/?text=${texto}`;
}

export function abrirWhatsApp(telefone: string | undefined, mensagem: string) {
  window.open(linkWhatsApp(telefone, mensagem), "_blank", "noopener,noreferrer");
}
