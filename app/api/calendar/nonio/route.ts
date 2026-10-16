import { NextRequest, NextResponse } from "next/server"

const NONIO_HOST = "inforestudante.ipc.pt"

function unfoldIcs(text: string) {
  return text.replace(/\r?\n[ \t]/g, "")
}

function unescapeIcs(value: string) {
  return value.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\")
}

function parseDate(value: string) {
  const clean = value.replace(/[^0-9TZ]/g, "")
  if (clean.length < 8) return null
  const year = Number(clean.slice(0, 4))
  const month = Number(clean.slice(4, 6)) - 1
  const day = Number(clean.slice(6, 8))
  const hour = Number(clean.slice(9, 11) || 0)
  const minute = Number(clean.slice(11, 13) || 0)
  return new Date(year, month, day, hour, minute).toISOString()
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url")
  if (!rawUrl) return NextResponse.json({ error: "Indica o endereço privado do Nónio." }, { status: 400 })

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: "O endereço do calendário não é válido." }, { status: 400 })
  }

  if (url.protocol !== "https:" || url.hostname !== NONIO_HOST || !url.pathname.includes("sincronizaHorarioNonio.do")) {
    return NextResponse.json({ error: "Por segurança, apenas endereços oficiais do Nónio IPC são aceites." }, { status: 400 })
  }

  try {
    const response = await fetch(url, { next: { revalidate: 900 } })
    if (!response.ok) throw new Error("feed unavailable")
    const ics = unfoldIcs(await response.text())
    const importedEvents = ics.split("BEGIN:VEVENT").slice(1).map((block) => {
      const field = (name: string) => block.match(new RegExp(`(?:^|\\n)${name}[^:]*:(.*)`))?.[1]?.trim()
      const start = field("DTSTART")
      return { title: unescapeIcs(field("SUMMARY") || "Evento escolar"), location: unescapeIcs(field("LOCATION") || ""), start: start ? parseDate(start) : null }
    }).filter((event) => event.start)

    return NextResponse.json({ events: importedEvents, source: "Nónio IPC", syncedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o horário agora. Confirma o endereço privado e tenta novamente." }, { status: 502 })
  }
}
