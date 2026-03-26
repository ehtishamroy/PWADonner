import Image from 'next/image';

interface IllProps {
    width?: number;
    height?: number;
    className?: string;
}

export function Helicopter({ width = 100, height = 80, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/images/helicopter.png" alt="Helicopter" fill className="object-contain" unoptimized />
        </div>
    );
}

export function Teddy({ width = 100, height = 100, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/images/teddy.png" alt="Teddy" fill className="object-contain" unoptimized />
        </div>
    );
}

export function Gift({ width = 100, height = 90, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/images/gift.png" alt="Gift Box" fill className="object-contain" unoptimized />
        </div>
    );
}

export function Duck({ width = 80, height = 70, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/images/duck.png" alt="Rubber Duck" fill className="object-contain" unoptimized />
        </div>
    );
}

export function Car({ width = 120, height = 80, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={className}>
            <Image src="/images/car.png" alt="Toy Car" fill className="object-contain" unoptimized />
        </div>
    );
}

export function ZebraCat({ width = 70, height = 70, className = '' }: IllProps) {
    return (
        <div style={{ width, height, position: 'relative' }} className={`drop-shadow-sm ${className}`}>
            <Image src="/images/zebracat.png" alt="Zebra Cat Sticker" fill className="object-contain" unoptimized />
        </div>
    );
}
