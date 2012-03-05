<?php

    function ymaps_routes_settings_form() {
        $form['api-key'] = array(
            '#type' => 'fieldset',
            '#title' => t('API key')
        );
        $form['api-key']['api-key-value'] = array(
            '#type' => 'textfield',
            '#title' => '',
            '#description' => t('If you don\'t have API key, you can get it here - <a href="http://api.yandex.ru/maps/form.xml">http://api.yandex.ru/maps/form.xml</a>. You should have an account on Yandex.'),
            '#default_value' => variable_get('ymaps-routes-api-key', '')
        );

        $form['content-types'] = array(
            '#type' => 'fieldset',
            '#title' => t('Content types')
        );
        $form['content-types']['content-types-list'] = array(
            '#type' => 'checkboxes',
            '#title' => '',
            '#description' => t('Select content types to display routes.'),
            '#options' => _ymaps_routes_get_content_types(),
            '#default_value' => variable_get('ymaps-routes-content-types', array())
        );

        $form['route-line-settings'] = array(
            '#type' => 'fieldset',
            '#title' => t('Route line settings'),
            '#description' => t('Default line settings for all routes. <b>Note, that the individual route settings will override default settings..</b>')
        );
        $form['route-line-settings']['route-line-width'] = array(
            '#type' => 'select',
            '#title' => t('Line width in pixels'),
            '#options' => drupal_map_assoc(array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
            '#default_value' => variable_get('ymaps-routes-line-width', 3)
        );
        $form['route-line-settings']['route-line-color'] = array(
            '#type' => 'textfield',
            '#title' => t('Line color in HEX'),
            '#maxlength' => 6,
            '#size' => 6,
            '#field_prefix' => '#',
            '#default_value' => variable_get('ymaps-routes-line-color', 'ff0000')
        );

        $form['submit'] = array(
            '#type' => 'submit',
            '#value' => t('Save settings for all routes')
        );

        return $form;
    }
    function ymaps_routes_settings_form_validate($elements, &$form_state) {
        if(empty($form_state['values']['api-key-value']))
            form_set_error('api-key-value', t('Field <em><b>API key</b></em> is required'));
        if(empty($form_state['values']['route-line-color']))
            form_set_error('route-line-color', t('Field <em><b>Line color</b></em> is required'));
        if(!preg_match('/^[a-z0-9]+$/i', $form_state['values']['route-line-color']))
            form_set_error('route-line-color', t('Value of field <em><b>Line color</b></em> should contains only alphabetic and numbers'));
    }
    function ymaps_routes_settings_form_submit($form, &$form_state) {
        variable_set('ymaps-routes-api-key', $form_state['values']['api-key-value']);

        $content_types = array();
        foreach($form_state['values']['content-types-list'] as $key => $value)
            if($value)
                $content_types[] = $key;
        variable_set('ymaps-routes-content-types', $content_types);

        variable_set('ymaps-routes-line-width', $form_state['values']['route-line-width']);
        variable_set('ymaps-routes-line-color', $form_state['values']['route-line-color']);

        drupal_set_message(t('Settings has been successful saved!'));
    }