import { ScreenHeader } from "@/components/ui/ScreenHeader"
import { Reveal } from "@/components/ui/Reveal"
import { Card } from "@/components/ui/Card"
import { InkCabinet } from "@/components/ui/InkCabinet"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { LevelSwitcher } from "@/components/ui/LevelSwitcher"
import { useTranslation } from "@/lib/useTranslation"

export function Settings() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-8 py-4">
      <ScreenHeader
        eyebrowJa="設定"
        eyebrowEn="SETTINGS"
        title={t('nav.settings')}
        description="Paper, density, typeface, language, and JLPT level — all saved to this device only."
        watermark="設"
      />

      <div className="flex flex-col gap-6 pb-16">
        <Reveal index={0}>
          <Card className="p-6">
            <h2 className="font-display text-xl mb-1">Paper &amp; structure</h2>
            <p className="text-sm text-muted mb-6">
              Nine paper tones, each with a RAW (sharp, thin-bordered) and NEO (rounded, thick-bordered) structural mode.
            </p>
            <InkCabinet />
          </Card>
        </Reveal>

        <Reveal index={1}>
          <Card className="p-6">
            <h2 className="font-display text-xl mb-1">Language</h2>
            <p className="text-sm text-muted mb-4">Switches UI chrome — nav, buttons, headers. Vocabulary/grammar meanings follow this too where translated.</p>
            <LanguageSwitcher />
          </Card>
        </Reveal>

        <Reveal index={2}>
          <Card className="p-6">
            <h2 className="font-display text-xl mb-1">JLPT level</h2>
            <p className="text-sm text-muted mb-4">Scopes Vocabulary, Review, and Homophones to N5, N4, or both combined.</p>
            <LevelSwitcher />
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
