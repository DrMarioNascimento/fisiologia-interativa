import type { Metadata } from 'next'
import { CycleSimulator } from '@/components/cycle/cycle-simulator'

export const metadata: Metadata = {
  title: 'Ciclo Menstrual e Gestação | Simulador Endócrino',
  description:
    'Simulador interativo dos hormônios femininos ao longo do ciclo menstrual e da gestação: GnRH, FSH, LH, prolactina, ocitocina, estradiol, progesterona e hCG.',
}

export default function Page() {
  return <CycleSimulator />
}
