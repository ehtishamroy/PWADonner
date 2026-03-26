import { AdminHeader } from '../../components/AdminHeader';
import ImagesController from '@/app/admin/settings/images/ImagesController';
import { BRAND } from '@/lib/constants';

export const metadata = { title: 'Einstellungen - Bilder & Inhalte' };

export default function SettingsImagesPage() {
    return (
        <>
            <AdminHeader />
            <main className="max-w-4xl mx-auto p-6 md:p-10">
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Einstellungen
                    </h2>
                    <p className="opacity-60">
                        Bilder & Inhalts Controller
                    </p>
                </div>

                <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Statische Bilder austauschen
                    </h3>
                    <p className="text-sm opacity-60 max-w-2xl mb-8 leading-relaxed">
                        Lade hier neue Dateien hoch, um die statischen Bilder der App (wie das Hintergrundbild, die App-Icons oder das Favicon) direkt auf dem Server zu überschreiben. 
                        <strong> Wichtig:</strong> Falls du nach dem Hochladen immer noch das alte Bild siehst, musst du deinen Browser-Cache leeren (Strg+F5) beziehungsweise Safari/Chrome auf dem Handy komplett neu starten.
                    </p>

                    <ImagesController />
                </div>
            </main>
        </>
    );
}
