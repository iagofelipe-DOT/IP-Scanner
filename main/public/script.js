$('#scan-btn').click(function() {
    
    const target = $('#target').val();
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
    
    $('.results-area').css("display","block");
    if (!ipv4Regex.test(target) && !domainRegex.test(target)) {
        $('#results').html('<p style="color: #f44336;">Por favor, insira um endereço IP ou Domínio válido.</p>');
        return;
    }

    function loadSearchHistory() {
        const searchHistory = JSON.parse(localStorage.getItem('IPs Search History')) || [];
        const list = $('#history-list');
        list.empty(); 
        
        History.forEach(ip => {
            list.append(`<li>${ip}</li>`);
        });
    }

    function saveSearchHistory(newIp) {
        let searchHistory = JSON.parse(localStorage.getItem('IPs Search History')) || [];
        
        if (!searchHistory.includes(newIp)) {
            searchHistory.unshift(newIp); 
            if (searchHistory.length > 5) searchHistory.pop(); 
            localStorage.setItem('IPs Search History', JSON.stringify(searchHistory));
            loadSearchHistory(); 
        }
    }

    $('#progress-container').show();
    $('#progress-bar').css('width', '0%').animate({ width: '100%' }, 2000);
    
    $.ajax({

        url: '/api/server',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ target: target }),

        success: function(response) {
            $('#progress-container').hide();
            $('#scan-btn').prop('disabled', false).text('Escanear');
            
            let tableHTML = '<table style="width:100%; text-align:left; border-collapse: collapse; margin-top: 15px;">';
            tableHTML += '<tr style="border-bottom: 2px solid #444;"><th style="padding: 10px;">Porta</th><th style="padding: 10px;">Status</th><th style="padding: 10px;">Serviço</th></tr>';
            
            response.results.forEach(function(item) {
                const color = item.status === 'Aberta' ? '#4caf50' : '#f44336';
                let service = 'Desconhecido';
                
                if (item.port === 80) service = 'HTTP';
                if (item.port === 443) service = 'HTTPS';
                if (item.port === 22) service = 'SSH';
                
                tableHTML += '<tr style="border-bottom: 1px solid #333;">';
                tableHTML += '<td style="padding: 8px;">' + item.port + '</td>';
                tableHTML += '<td style="padding: 8px; color: ' + color + ';">' + item.status + '</td>';
                tableHTML += '<td style="padding: 8px;">' + service + '</td>';
                tableHTML += '</tr>';
            });
            
            tableHTML += '</table>';
            $('#results').html(tableHTML);
            saveSearchHistory(target);
        },

        error: function() {
            $('#progress-container').hide();
            $('#scan-btn').prop('disabled', false).text('Escanear');
            $('#results').html('<p style="color: #f44336;">Erro ao conectar com o servidor. Tente novamente.</p>');
        }
    
    });

    //Popular services logic, going to be in a separate module later
    function checkPopularServices() {

        const popularTargets = [
            { ip: '8.8.8.8', elementId: '#status-google' },
            { ip: '1.1.1.1', elementId: '#status-cloudflare' },
            { ip: 'facebook.com', elementId: '#status-meta' }
        ];

        popularTargets.forEach(target => {
            $.ajax({
                url: '/api/server',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ target: target.ip }),

                success: function(response) {

                    const webPort = response.results.find(result => result.port === 443);
                    const $statusElement = $(target.elementId);

                    if (webPort && webPort.status === 'Aberta') {
                        $statusElement.text('Online').css('color', 'green');
                    } else {
                        $statusElement.text('Instável/Offline').css('color', 'red');
                    }
                },

                error: function() {
                    $(target.elementId).text('Erro de Leitura').css('color', 'orange');
                }

            });
        });
    }
});

$(document).ready(function() {
    loadSearchHistory();
    checkPopularServices();
});
