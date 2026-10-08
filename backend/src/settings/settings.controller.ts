import { Controller, Get } from '@nestjs/common';

@Controller('settings')
export class SettingsController {
  private settings = {
    id: 'kiosk_main_settings',
    nombreKiosco: 'Kiosco Central Escolar',
    logo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100',
    telefono: '11-4567-8901',
    horarioApertura: '07:30',
    horarioCierre: '18:00',
    abierto: true,
    mensajeCerrado: 'El kiosco se encuentra cerrado fuera del horario escolar.',
    aliasMercadoPago: 'kiosco.escolar.mp',
    cbu: '0000003100010000000001',
    titularCuenta: 'Cooperadora Kiosco Escolar',
    qrMercadoPago: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=kiosco.escolar.mp',
    permitirPedidosRecreo: true,
    sonidoNotificaciones: true,
    recreosDisponibles: [
      { id: 'rec_1', nombre: '1° Recreo (Mañana)', horaInicio: '09:30', horaFin: '09:45', activo: true },
      { id: 'rec_2', nombre: '2° Recreo (Mañana)', horaInicio: '11:15', horaFin: '11:30', activo: true },
      { id: 'rec_3', nombre: 'Almuerzo / Mediodía', horaInicio: '13:00', horaFin: '13:40', activo: true },
      { id: 'rec_4', nombre: 'Recreo Tarde', horaInicio: '15:30', horaFin: '15:45', activo: true },
    ],
  };

  @Get()
  getSettings() {
    return { settings: this.settings };
  }
}
