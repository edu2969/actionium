import { Orbitron } from 'next/font/google'

export const orbitron_init = Orbitron({
    subsets: ['latin'],
    weight: "400",
    display: 'swap',
    variable: '--font-orbitron'
});

export const orbitron = orbitron_init.variable;