'use client';

import { useState } from 'react';
import EditDonationModal from './EditDonationModal';

interface EditDonationButtonProps {
    donation: {
        id: string;
        toyName: string;
        category: string;
        ageRange: string;
        condition: string;
        description: string;
    };
}

export default function EditDonationButton({ donation }: EditDonationButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold uppercase tracking-widest text-[#537D61] hover:underline"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
                Bearbeiten
            </button>
            {isModalOpen && (
                <EditDonationModal
                    donation={donation}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}
