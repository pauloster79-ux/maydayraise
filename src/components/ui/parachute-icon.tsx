import Image from 'next/image';

export function ParachuteIcon({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <Image
                src="/parachute-v2.png"
                alt="Parachute"
                fill
                className="object-contain"
                unoptimized
            />
        </div>
    );
}
