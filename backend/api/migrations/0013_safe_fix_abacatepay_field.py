from django.db import migrations


class Migration(migrations.Migration):

    # IMPORTANTE: esta migração ignora a 0012 e depende da 0011
    dependencies = [
        ("api", "0011_add_registration_number"),
    ]

    operations = [
        # Remover coluna antiga se existir (idempotente)
        migrations.RunSQL(
            sql=(
                "ALTER TABLE api_raceregistration "
                "DROP COLUMN IF EXISTS registration_email_sent;"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),

        # Garantir colunas novas (idempotente)
        migrations.RunSQL(
            sql=(
                "ALTER TABLE api_raceregistration "
                "ADD COLUMN IF NOT EXISTS abacatepay_pix_id varchar(255);"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            sql=(
                "ALTER TABLE api_raceregistration "
                "ADD COLUMN IF NOT EXISTS coupon_code varchar(50);"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            sql=(
                "ALTER TABLE api_raceregistration "
                "ADD COLUMN IF NOT EXISTS coupon_discount decimal(10,2);"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]