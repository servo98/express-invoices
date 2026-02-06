import type { AsciiArtService } from "@/domain/ports/services";

const ASCII_ART_COLLECTION = [
  `  (\\____/)
  ( ͡° ͜ʖ ͡°)
  />    \\>  FACTURA TIME!`,

  `    ∧＿∧
  ( ・∀・) Invoice o'clock!
  /    つ
 (  /   )
  しーJ`,

  `  ┌───────────┐
  │  $$$$$$$  │
  │  FACTURA  │
  │   TIME!   │
  └───────────┘
    (\\__/)  ||
    (•ㅅ•)  ||
    / 　 づ`,

  `  ⠀⣞⢽⢪⢣⢣⢣⢫⡺⡁
  ⠀⢁⢇⢸⢸⢸⢸⢸⢨⢂⢁
  ⠀⡁⡢⠢⡁⠸⣸⢁⢃⠃
  ⠀⢁⡁⡀⡀⡀⡰⡁⡁
  No factura yet?   ⡁
  ⠀⡁⡁⡁⡁⡁⡁⡁⡁`,

  `  ╔══════════════╗
  ║  TAX SEASON!  ║
  ║   ¯\\_(ツ)_/¯  ║
  ╚══════════════╝`,

  `  ┏━━━━━━━━━━━━━━┓
  ┃  SAT is       ┃
  ┃  watching...  ┃
  ┃    (⌐■_■)     ┃
  ┗━━━━━━━━━━━━━━┛`,

  ` ░░░░░░░░░░░░░░░░
 ░ HOLA SAT ░░░░░░
 ░░░░░░░░░░░░░░░░
   \\(°□°)/
    |   |
   / \\ / \\`,

  `  ☆ﾟ.*･｡ﾟ FACTURA ☆ﾟ.*･｡ﾟ
     (\\__/)
     (>.<)  Hazla ya!
    ⊂(  )⊃
     (_)(_)`,

  `  ╭─────────────╮
  │ 📋 INVOICE  │
  │    REMINDER │
  │  ᕦ(ò_óˇ)ᕤ  │
  ╰─────────────╯`,

  `    ___________
   |           |
   | FACTURA!! |
   |___________|
   (\\__/) ||
   (•ㅅ•) ||
   / 　 づ`,

  `  ▄▄▄▄▄▄▄▄▄▄▄▄▄
  █ DON'T FORGET █
  █  YOUR CFDI!  █
  ▀▀▀▀▀▀▀▀▀▀▀▀▀
    \\( ⚆ _ ⚆ )/`,

  `     /\\_/\\
    ( o.o )
     > ^ <  meow...
  Haz tu factura`,

  `  ╔═══════════════╗
  ║ RECORDATORIO!! ║
  ║  💰💰💰💰💰  ║
  ║ Haz tu factura ║
  ╚═══════════════╝`,

  `  ┌──────────┐
  │ CTRL + F │
  │ (Factura) │
  └──────────┘
  ( •_•)>⌐■-■
  (⌐■_■)`,

  `  (╯°□°)╯︵ ┻━┻
  ¡FACTURA PENDIENTE!
  ┬─┬ノ( º _ ºノ)
  ok ya la hago...`,

  `   ___
  |SAT|  ⚡ REMINDER ⚡
  |___|
  (  ͡° ͜ʖ ͡° )つ━☆
  Make that invoice!`,

  `  ┌─────────────────┐
  │  🇲🇽  FACTURANDO  │
  │   COMO CHAMPION  │
  │    ᕙ(⇀‸↼‶)ᕗ     │
  └─────────────────┘`,

  `    🧾🧾🧾
  ║ INVOICE TIME! ║
  ║  ∩(︶▽︶)∩   ║
    🧾🧾🧾`,

  `  IT'S THAT TIME AGAIN...
     .-"-.
    /|6 6|\\
   {/(_0_)\\}
    _/{" "}\\_
   }\\/  /\\/{
   FACTURA NOW!`,

  `  ╭━━━╮
  ┃ $ ┃  HEY!
  ╰━━━╯  Invoice time
  ʕ•ᴥ•ʔ  Don't forget!`,
];

export class AsciiArtServiceImpl implements AsciiArtService {
  getRandomArt(): string {
    const index = Math.floor(Math.random() * ASCII_ART_COLLECTION.length);
    return ASCII_ART_COLLECTION[index];
  }
}
