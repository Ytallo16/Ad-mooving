from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0011_add_registration_number"),
    ]

    operations = [
        # Garantir que a coluna antiga (caso ainda exista em algum ambiente) seja removida sem quebrar
        migrations.RunSQL(
            sql=(
                "ALTER TABLE api_raceregistration "
                "DROP COLUMN IF EXISTS registration_email_sent;"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),

        # Garantir que a coluna nova exista (idempotente)
        migrations.RunSQL(
            sql=(
                "ALTER TABLE api_raceregistration "
                "ADD COLUMN IF NOT EXISTS abacatepay_pix_id varchar(255);"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),

        # Adicionar campos de cupom se não existirem
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



from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0012_remove_raceregistration_registration_email_sent_and_more"),
    ]

    operations = [
        # Garantir que a coluna antiga (caso ainda exista em algum ambiente) seja removida sem quebrar
        migrations.RunSQL(
            sql=(
                "ALTER TABLE api_raceregistration "
                "DROP COLUMN IF EXISTS registration_email_sent;"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),

        # Garantir que a coluna nova exista (idempotente)
        migrations.RunSQL(
            sql=(
                "ALTER TABLE api_raceregistration "
                "ADD COLUMN IF NOT EXISTS abacatepay_pix_id varchar(255);"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]


