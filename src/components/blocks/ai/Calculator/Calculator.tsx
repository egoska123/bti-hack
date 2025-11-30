import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import calculatorIcon from '@/assets/icons/calculator-icon.svg';

export interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkType {
  id: string;
  label: string;
  price: number;
  area?: number;
  unitPrice?: number;
  isHighComplexity?: boolean;
}

interface Feature {
  id: string;
  label: string;
  coefficient: number;
}

const WORK_TYPES: WorkType[] = [
  { id: '1', label: 'Снос/возведение перегородок', price: 0, area: 50, unitPrice: 3000 },
  { id: '2', label: 'Объединение/перенос/устройство санузла', price: 80000 },
  { id: '3', label: 'Перестановка сантехприборов', price: 35000 },
  { id: '4', label: 'Перенос проемов', price: 45000 },
  { id: '5', label: 'Проемы в несущих стенах', price: 150000, isHighComplexity: true },
];

const FEATURES: Feature[] = [
  { id: '1', label: 'Перенос кухни/газовой плиты', coefficient: 1.4 },
  { id: '2', label: 'Объединение квартир', coefficient: 1.6 },
];

const DISTRICTS = [
  { value: 'central', label: 'Центральный (коэф. 1.3)', coefficient: 1.3 },
  { value: 'western', label: 'Западный (коэф. 1.2)', coefficient: 1.2 },
  { value: 'karasun', label: 'Карасунский (коэф. 1.15)', coefficient: 1.15 },
  { value: 'prikuban', label: 'Прикубанский (коэф. 1.1)', coefficient: 1.1 },
];

const HOUSE_TYPES = [
  { value: 'panel', label: 'Панельный (коэф. 1.0)', coefficient: 1.0 },
  { value: 'brick', label: 'Кирпичный (коэф. 1.15)', coefficient: 1.15 },
  { value: 'monolith', label: 'Монолитный (коэф. 1.25)', coefficient: 1.25 },
  { value: 'old', label: 'Старый фонд (коэф. 1.35)', coefficient: 1.35 },
];

export const Calculator = ({ isOpen, onClose }: CalculatorProps) => {
  const [apartmentArea, setApartmentArea] = useState('50');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedHouseType, setSelectedHouseType] = useState<string>('');
  const [selectedWorks, setSelectedWorks] = useState<Set<string>>(new Set());
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());

  const handleWorkToggle = (workId: string) => {
    const newSelected = new Set(selectedWorks);
    if (newSelected.has(workId)) {
      newSelected.delete(workId);
    } else {
      newSelected.add(workId);
    }
    setSelectedWorks(newSelected);
  };

  const handleFeatureToggle = (featureId: string) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureId)) {
      newSelected.delete(featureId);
    } else {
      newSelected.add(featureId);
    }
    setSelectedFeatures(newSelected);
  };

  const calculateCost = () => {
    let total = 0;

    // Суммируем стоимость работ
    selectedWorks.forEach((workId) => {
      const work = WORK_TYPES.find((w) => w.id === workId);
      if (work) {
        if (work.area && work.unitPrice) {
          total += work.area * work.unitPrice;
        } else {
          total += work.price;
        }
      }
    });

    // Применяем коэффициенты округа
    const district = DISTRICTS.find((d) => d.value === selectedDistrict);
    if (district) {
      total *= district.coefficient;
    }

    // Применяем коэффициенты типа дома
    const houseType = HOUSE_TYPES.find((h) => h.value === selectedHouseType);
    if (houseType) {
      total *= houseType.coefficient;
    }

    // Применяем коэффициенты особенностей
    selectedFeatures.forEach((featureId) => {
      const feature = FEATURES.find((f) => f.id === featureId);
      if (feature) {
        total *= feature.coefficient;
      }
    });

    return Math.round(total);
  };

  const totalCost = calculateCost();
  const workCount = selectedWorks.size;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const handleContinue = () => {
    // Здесь можно добавить логику для продолжения с данными
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader className="px-6 pt-4 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={calculatorIcon} alt="" className="w-5 h-5" />
              <DialogTitle className="text-lg font-normal">
                Калькулятор стоимости перепланировки
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Базовые параметры */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="text-base font-normal">Базовые параметры</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apartment-area">Площадь квартиры (кв. м)</Label>
                <Input
                  id="apartment-area"
                  type="text"
                  value={apartmentArea}
                  onChange={(e) => setApartmentArea(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Округ Краснодара</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Выберите округ" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((district) => (
                      <SelectItem key={district.value} value={district.value}>
                        {district.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="house-type">Тип дома</Label>
                <Select value={selectedHouseType} onValueChange={setSelectedHouseType}>
                  <SelectTrigger id="house-type">
                    <SelectValue placeholder="Выберите тип дома" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUSE_TYPES.map((houseType) => (
                      <SelectItem key={houseType.value} value={houseType.value}>
                        {houseType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Виды работ */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="text-base font-normal">Виды работ</h3>
            <div className="space-y-3">
              {WORK_TYPES.map((work) => {
                const workPrice = work.area && work.unitPrice 
                  ? `${work.area} кв.м × ${formatPrice(work.unitPrice)} ₽`
                  : `${formatPrice(work.price)} ₽`;
                
                return (
                  <div key={work.id} className="flex items-start gap-3">
                    <Checkbox
                      id={`work-${work.id}`}
                      checked={selectedWorks.has(work.id)}
                      onCheckedChange={() => handleWorkToggle(work.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <Label
                        htmlFor={`work-${work.id}`}
                        className="text-sm font-normal text-muted-foreground cursor-pointer flex-1"
                      >
                        {work.label} ({workPrice})
                      </Label>
                      {work.isHighComplexity && (
                        <span className="inline-flex items-center justify-center h-9 px-2.5 rounded-full bg-[#e7000b] text-white text-xs whitespace-nowrap">
                          Высокая сложность
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Особенности */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="text-base font-normal">Особенности (повышающие коэффициенты)</h3>
            <div className="space-y-3">
              {FEATURES.map((feature) => (
                <div key={feature.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`feature-${feature.id}`}
                    checked={selectedFeatures.has(feature.id)}
                    onCheckedChange={() => handleFeatureToggle(feature.id)}
                  />
                  <Label
                    htmlFor={`feature-${feature.id}`}
                    className="text-sm font-normal text-muted-foreground cursor-pointer flex-1"
                  >
                    {feature.label} (коэф. ×{feature.coefficient})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Итоговая стоимость */}
          <div className="bg-zinc-900 text-white rounded-lg p-6 space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80">Количество видов работ:</span>
              <span className="text-lg">{workCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg">Ориентировочная стоимость:</span>
              <span className="text-3xl">{formatPrice(totalCost)} ₽</span>
            </div>
          </div>

          {/* Примечание */}
          <div className="border rounded-lg p-6 space-y-2.5">
            <p className="text-sm font-bold text-[#7b3306]">Примечание:</p>
            <p className="text-sm font-normal text-[#7b3306] whitespace-pre-wrap">
              Расчет ориентировочный. Точная стоимость утверждается исполнителем после анализа документов и выезда на объект.
            </p>
          </div>

          {/* Кнопка продолжения */}
          <Button
            onClick={handleContinue}
            className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            Продолжить с этими данными
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
