package com.employee.Emp.config;

import com.employee.Emp.Entity.SequenceEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

@Component
public class SequenceModelListener extends AbstractMongoEventListener<SequenceEntity> {

    private final SequenceGeneratorService sequenceGeneratorService;

    @Autowired
    public SequenceModelListener(SequenceGeneratorService sequenceGeneratorService) {
        this.sequenceGeneratorService = sequenceGeneratorService;
    }

    @Override
    public void onBeforeConvert(BeforeConvertEvent<SequenceEntity> event) {
        SequenceEntity entity = event.getSource();
        if (entity != null && (entity.getId() == null || entity.getId() == 0)) {
            entity.setId(sequenceGeneratorService.generateSequence(entity.getSequenceName()));
        }
    }
}
