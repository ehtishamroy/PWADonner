import Image from 'next/image';

interface IllProps {
    width?: number;
    height?: number;
    className?: string;
}

export function Helicopter({ width = 100, height = 80, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/api/img/ill-helicopter" alt="Helicopter" fill className="object-contain" unoptimized />
        </div>
    );
}

export function Teddy({ width = 100, height = 100, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/api/img/ill-teddy" alt="Teddy" fill className="object-contain" unoptimized />
        </div>
    );
}

export function Gift({ width = 100, height = 90, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/api/img/ill-gift" alt="Gift Box" fill className="object-contain" unoptimized />
        </div>
    );
}

export function Duck({ width = 80, height = 70, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/api/img/ill-duck" alt="Rubber Duck" fill className="object-contain" unoptimized />
        </div>
    );
}

export function Car({ width = 120, height = 80, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/api/img/ill-car" alt="Toy Car" fill className="object-contain" unoptimized />
        </div>
    );
}

export function ZebraCat({ width = 70, height = 70, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={`drop-shadow-sm ${className}`}>
            <Image src="/api/img/ill-zebracat" alt="Zebra Cat Sticker" fill className="object-contain" unoptimized />
        </div>
    );
}
