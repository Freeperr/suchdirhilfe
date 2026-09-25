const contact = "info@fynnpetersen.de";
const offerLink = `mailto:${contact}?subject=${encodeURIComponent("Preisvorschlag für suchdirhilfe.de")}&body=${encodeURIComponent("Hallo Fynn,\n\nich interessiere mich für suchdirhilfe.de.\nMein Preisvorschlag: \n\nViele Grüße")}`;

function Address() {
  return (
    <address>
      Fynn Leo Holger Petersen<br />
      Warnckesweg 23<br />
      22453 Hamburg<br />
      Deutschland<br />
      <a href={`mailto:${contact}`}>{contact}</a>
    </address>
  );
}

export default function Home() {
  return (
    <div className="page">
      <main>
        <h1>suchdirhilfe<span>.de</span></h1>
        <div className="offer"><p className="intro">Diese Domain steht zum Verkauf.<br />Interesse? Sende mir deinen Preisvorschlag per E-Mail.</p>
        <div className="actions">
          <a className="button" href={offerLink}>Preis vorschlagen</a>
          <a className="email" href={`mailto:${contact}`}>{contact}</a>
        </div></div>
      </main>
      <footer aria-label="Rechtliche Informationen">
        <details id="impressum">
          <summary>Impressum</summary>
          <section className="legal" aria-labelledby="impressum-heading">
            <h2 id="impressum-heading">Impressum</h2>
            <Address />
            <p>Website: <a href="https://fynnpetersen.de">fynnpetersen.de</a></p>
          </section>
        </details>
        <details id="datenschutz">
          <summary>Datenschutz</summary>
          <section className="legal" aria-labelledby="datenschutz-heading">
            <h2 id="datenschutz-heading">Datenschutzerklärung</h2>
            <h3>1. Verantwortlicher</h3>
            <Address />
            <h3>2. Hosting und Bereitstellung der Website</h3>
            <p>Diese Website wird bei Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA, gehostet. Beim Aufruf werden technische Verbindungsdaten verarbeitet. Hierzu können IP-Adresse, Zeitpunkt des Zugriffs, angeforderte Adresse, Browser- und Geräteinformationen sowie die verweisende Seite gehören.</p>
            <p>Die Verarbeitung dient der Auslieferung, Stabilität und Sicherheit dieser Website sowie der Missbrauchsabwehr. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der sicheren und zuverlässigen Bereitstellung dieses Angebots. Empfänger sind Vercel und die zur Bereitstellung eingesetzten Dienstleister.</p>
            <p>Eine Verarbeitung in den USA und weiteren Ländern ist möglich. Vercels Datenschutzvereinbarung sieht für einschlägige Drittlandübermittlungen EU-Standardvertragsklauseln vor. Einzelheiten und die Übermittlungsgarantien finden Sie in der <a href="https://vercel.com/legal/dpa">Datenschutzvereinbarung von Vercel</a>.</p>
            <p>Technische Daten werden so lange verarbeitet, wie dies für die Bereitstellung, die Untersuchung von Störungen und Sicherheitsvorfällen oder die Erfüllung gesetzlicher Pflichten erforderlich ist. Maßgeblich sind der jeweilige Verarbeitungszweck und die hierfür erforderliche Aufbewahrung. Weitere Informationen enthält die <a href="https://vercel.com/legal/privacy-notice">Datenschutzerklärung von Vercel</a>.</p>
            <h3>3. GitHub</h3>
            <p>GitHub dient der Verwaltung des Quellcodes und der Bereitstellung über Vercel. Die Website bindet keine Skripte oder Inhalte von GitHub ein. Beim normalen Seitenaufruf stellt der Seitencode keine Verbindung zu GitHub her.</p>
            <h3>4. Kontaktaufnahme per E-Mail</h3>
            <p>Bei einer Kontaktaufnahme verarbeiten wir Ihre E-Mail-Adresse, den Inhalt Ihrer Nachricht und freiwillige Angaben wie Ihren Namen oder Preisvorschlag, um Ihre Anfrage zu beantworten. Zur Übermittlung und Verwaltung der Nachrichten werden E-Mail-Dienstleister eingesetzt.</p>
            <p>Für Anfragen zum Domainkauf ist die Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen). Sonstige Anfragen bearbeiten wir auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist die Beantwortung der Nachricht.</p>
            <p>Die Korrespondenz wird gelöscht, sobald sie für die Anfrage oder eine Vertragsabwicklung nicht mehr benötigt wird. Gesetzliche Aufbewahrungspflichten und die erforderliche Speicherung zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen bleiben vorbehalten. Nach Wegfall dieser Gründe werden die Daten gelöscht.</p>
            <p>Ihre Angaben sind freiwillig. Ohne die zur Bearbeitung erforderlichen Informationen und eine Kontaktadresse können wir Ihre Anfrage nicht beantworten. Der E-Mail-Link öffnet Ihr E-Mail-Programm. Eine Nachricht wird erst durch Ihren Versand übermittelt.</p>
            <h3>5. Cookies und Analysewerkzeuge</h3>
            <p>Der Seitencode setzt keine Cookies und nutzt keinen lokalen Browserspeicher. Es sind keine Analyse- oder Werbeskripte, externen Schriftarten oder Social-Media-Plugins eingebunden.</p>
            <h3>6. Ihre Rechte</h3>
            <p>Unter den gesetzlichen Voraussetzungen haben Sie das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO) und Datenübertragbarkeit (Art. 20 DSGVO).</p>
            <p><strong>Widerspruchsrecht:</strong> Soweit eine Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO beruht, können Sie aus Gründen Ihrer besonderen Situation nach Art. 21 DSGVO widersprechen. Die Verarbeitung wird dann eingestellt, sofern keine zwingenden schutzwürdigen Gründe bestehen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen dient.</p>
            <p>Soweit eine Verarbeitung auf einer Einwilligung beruht, können Sie diese jederzeit für die Zukunft widerrufen. Die Rechtmäßigkeit der bisherigen Verarbeitung bleibt unberührt. Zur Ausübung Ihrer Rechte wenden Sie sich an <a href={`mailto:${contact}`}>{contact}</a>.</p>
            <h3>7. Beschwerderecht</h3>
            <p>Sie können sich nach Art. 77 DSGVO bei einer Datenschutzaufsichtsbehörde beschweren, insbesondere an Ihrem gewöhnlichen Aufenthaltsort, Ihrem Arbeitsplatz oder am Ort des vermuteten Verstoßes.</p>
            <p>In Hamburg: Der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit, Ludwig-Erhard-Str. 22, 20459 Hamburg. <a href="https://datenschutz-hamburg.de/service-information/beschwerde-oder-hinweis-einreichen">Beschwerde einreichen</a>.</p>
            <h3>8. Automatisierte Entscheidungen</h3>
            <p>Im Rahmen dieses Angebots setzen wir keine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne von Art. 22 DSGVO ein.</p>
          </section>
        </details>
      </footer>
    </div>
  );
}
