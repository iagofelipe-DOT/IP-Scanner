$(document).ready(function() {
    $('#scan-btn').click(function() {
        
        const target = $('#target').val();
        const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
        
        $('.results-area').css("display","block");
        if (!ipv4Regex.test(target) && !domainRegex.test(target)) {
            $('#results').html('<p style="color: #f44336;">Por favor, insira um endereço IP ou Domínio válido.</p>');
            return;
        }

       
        $(this).prop('disabled', true).text('Escaneando...');
        $('#results').html('<p>Iniciando varredura em <strong>' + target + '</strong>...</p>');

        $('#progress-container').show();
        $('#progress-bar').css('width', '0%').animate({ width: '100%' }, 2000);
        setTimeout(function() {
            $('#scan-btn').prop('disabled', false).text('Escanear');

            const mockResults = `
                <table style="width:100%; text-align:left; border-collapse: collapse; margin-top: 15px;">
                    <tr style="border-bottom: 2px solid #444;">
                        <th style="padding: 10px;">Porta</th>
                        <th style="padding: 10px;">Status</th>
                        <th style="padding: 10px;">Serviço</th>
                    </tr>
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 8px;">80</td>
                        <td style="padding: 8px; color: #4caf50;">Aberta</td>
                        <td style="padding: 8px;">HTTP</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 8px;">443</td>
                        <td style="padding: 8px; color: #4caf50;">Aberta</td>
                        <td style="padding: 8px;">HTTPS</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;">22</td>
                        <td style="padding: 8px; color: #f44336;">Fechada</td>
                        <td style="padding: 8px;">SSH</td>
                    </tr>
                </table>`;
            
            $('#results').html(mockResults);
        }, 2000);
    });
});