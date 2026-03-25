export const metadata = {
    title: 'Über Wärme schenken',
};

export default function AboutPage() {
    return (
        <article className="prose prose-sm md:prose-base max-w-none">
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Über Wärme schenken
            </h1>
            
            <p className="italic opacity-80 mb-8 border-l-4 pl-4 border-mustard">
                "Zweifle nie daran, dass eine kleine Gruppe von Menschen die Welt verändern kann. Tatsächlich sind das die Einzigen, die es je getan haben." - Margaret Mead
            </p>

            <p className="mb-4">
                Unsere erste Aktion mit den Wärmflaschen war ein Schnellschuss, der auf so viel positive Rückmeldung und Unterstützung gestossen ist, dass wir es nicht bei einer einmaligen Sache belassen konnten.
            </p>

            <p className="mb-10 font-bold">
                Unser Ziel ist es mit einfachen Ideen Menschen, die es im Leben schwer haben, etwas Wärme zu schenken. Wir verändern damit (noch) nicht die Welt, aber machen sie zumindest für einige etwas menschlicher.
            </p>

            <hr className="my-8 border-gray-100" />

            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Das Team
            </h2>

            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-lg">Catharina Müller</h3>
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Präsidentin</p>
                    <p className="opacity-80">Wenn sie sich etwas in den Kopf gesetzt hat, dann setzt sie es auch um - und das am liebsten gestern. Sie ist äusserst engagiert und fast genauso ungeduldig. Als Mama einer kleinen Tochter weiss sie hohe Erwartungen und Zeitdruck zu jonglieren.</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg">Gaby Jenni</h3>
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Vize-Präsidentin</p>
                    <p className="opacity-80">Wenn man sie mit einer Songzeile beschreiben müsste, wäre dies wohl in den Worten von Alain Clark: "My feet are on the ground, my head is in the clouds." In ihrem Kopf schwirren unzählige Gedanken und Ideen. Mit ihrem Sinn für Ordnung und Struktur meistert sie den Spagat zwischen Kopf und Fuss.</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg">Michael Müller</h3>
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Kassier</p>
                    <p className="opacity-80">Mit seiner ruhigen und analytischen Art, ist er der perfekte Gegenpol zum Rest der Truppe. Er versteht es, die Ideen einzufangen und zu strukturieren. Genauso wie er sich als Papa um das Wohl seiner beiden Damen kümmert, so setzt er sich auch mit Herzblut für "Wärme schenken" ein.</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg">Vanessa Wyniger</h3>
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Vereinsmitglied, Social Media</p>
                    <p className="opacity-80">Als unser erstes Vereinsmitglied unterstützt uns Vanessa mit ihren kreativen Ideen und der Liebe fürs Detail vor allem in der Kommunikation und Social Media. Gleichzeitig freuen wir uns, dass wir unser Team für den bevorstehenden Andrang mit ihr aufrüsten durften.</p>
                </div>
            </div>
            
            <hr className="my-8 border-gray-100" />
            
            <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold mb-2">Möchtest du uns unterstützen?</h3>
                <p className="opacity-80 text-sm">
                    Du hast keine Spielzeuge, die du spenden kannst, aber würdest dich gerne beteiligen? Finde heraus, wie du uns unterstützen kannst. Wir freuen uns!
                </p>
            </div>
        </article>
    );
}
