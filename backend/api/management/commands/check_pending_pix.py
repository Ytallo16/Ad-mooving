"""
Management command para verificar pagamentos PIX pendentes.

Consulta a API do AbacatePay para cada inscrição PENDING que tenha
um abacatepay_pix_id e, se o pagamento foi confirmado, marca como PAID,
gera número de inscrição e envia email.

Uso:
    python manage.py check_pending_pix          # verifica todos os pendentes
    python manage.py check_pending_pix --dry-run  # apenas mostra o que faria

Pode ser agendado via cron, ex: a cada 5 minutos
    */5 * * * * cd /app && python manage.py check_pending_pix >> /var/log/check_pix.log 2>&1
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import RaceRegistration
from api.services import check_abacatepay_payment_status, mark_registration_paid_atomic


class Command(BaseCommand):
    help = 'Verifica pagamentos PIX pendentes na API do AbacatePay e atualiza os que foram pagos.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Apenas mostra o que seria feito, sem alterar nada.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        # Buscar inscrições PENDING que possuem pix_id (ou seja, geraram QR Code)
        pending = RaceRegistration.objects.filter(
            payment_status='PENDING',
            abacatepay_pix_id__isnull=False,
        ).exclude(
            abacatepay_pix_id='',
        )

        total = pending.count()
        if total == 0:
            self.stdout.write(self.style.SUCCESS('Nenhum pagamento PIX pendente para verificar.'))
            return

        self.stdout.write(f'[{timezone.now():%Y-%m-%d %H:%M:%S}] Verificando {total} pagamento(s) PIX pendente(s)...')

        updated = 0
        errors = 0

        for reg in pending:
            pix_id = reg.abacatepay_pix_id
            self.stdout.write(f'  -> #{reg.id} {reg.full_name} | PIX: {pix_id}', ending='')

            try:
                result = check_abacatepay_payment_status(pix_id)

                if not result.get('success'):
                    self.stdout.write(self.style.WARNING(f' | ERRO: {result.get("error", "?")}'))
                    errors += 1
                    continue

                status_pix = result.get('status')
                self.stdout.write(f' | Status: {status_pix}', ending='')

                if status_pix == 'PAID':
                    if dry_run:
                        self.stdout.write(self.style.SUCCESS(' | [DRY-RUN] Seria marcado como PAGO'))
                    else:
                        changed = mark_registration_paid_atomic(reg.id)
                        if changed:
                            self.stdout.write(self.style.SUCCESS(' | ✅ MARCADO COMO PAGO'))
                            updated += 1
                        else:
                            self.stdout.write(self.style.SUCCESS(' | (já estava pago)'))
                else:
                    self.stdout.write(f' | Ainda {status_pix}')

            except Exception as e:
                self.stdout.write(self.style.ERROR(f' | EXCEÇÃO: {e}'))
                errors += 1

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Concluído: {updated} atualizado(s), {errors} erro(s), {total} verificado(s).'
        ))
